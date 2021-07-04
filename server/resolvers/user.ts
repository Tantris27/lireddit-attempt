import argon2 from 'argon2';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { v4 } from 'uuid';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { sendEmail } from '../utils/sendEmail';
import { validateRegister } from '../utils/validateRegister';
import { UsernamePasswordInput } from './UsernamePasswordInput';

// @InputType()
// class UsernamePasswordInput {
//   @Field(() => String)
//   username!: string;
//   @Field(() => String)
//   email!: string;
//   @Field(() => String)
//   password!: string;
// }
@ObjectType()
class FieldError {
  @Field(() => String)
  field!: string;
  @Field(() => String)
  message!: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, em, req }: MyContext,
  ): Promise<UserResponse> {
    if (newPassword.length < 3) {
      return {
        errors: [
          { field: 'newPassword', message: 'length must be greater than 3' },
        ],
      };
    }
    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);
    if (!userId) {
      return { errors: [{ field: 'token', message: 'token expired' }] };
    }
    const intId = parseInt(userId);
    const user = await em.findOne(User, { id: intId });
    if (!user) {
      return { errors: [{ field: 'token', message: "User doesn't exist" }] };
    }
    user.password = await argon2.hash(newPassword);
    await em.persistAndFlush(user);

    // delete the token after completion (uncomment after testing)
    // redis.del(FORGET_PASSWORD_PREFIX + token);

    // log in the user
    req.session.userId = intId;
    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Ctx() { em, redis }: MyContext,
  ) {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    );
    if (!user) {
      // no user with email in database
      return true;
    }
    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 3,
    ); // 3 Stunden

    await sendEmail(
      user.email,
      `<a href="http://localhost:3000/change-password/${token}">reset password<a>`,
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    console.log(req.session);
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    // console.log('Me Query User: ', user);
    return user;
  }
  @Query(() => [User])
  users(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {});
  }
  @Mutation(() => UserResponse)
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    const reponse = validateRegister(options);
    const errors = await reponse;
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = await em.create(User, {
      username: options.username,
      email: options.email,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === '23505') {
        // ||err.detail.includes('already exists')) {
        return {
          errors: [
            {
              field: 'username',
              message: 'That Username is already in use ',
            },
          ],
        };
      }
    }
    // Will login after registration by setting a cookie
    req.session.userId = user.id;
    return { user };
  }

  // return { user };
  // }
  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail')
    usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContext,
  ) {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    );
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: "that username doesn't exist",
          },
        ],
      };
    }
    const validPassword = await argon2.verify(user.password, password);
    // console.log(!validPassword);
    // console.log('user.password: ', user.password);
    // console.log('options.password: ', options.password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: 'password',
            message: 'invalid Password',
          },
        ],
      };
    }
    req.session.userId = user.id;
    return { user };
  }
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((response) =>
      req.session.destroy((err) => {
        if (err) {
          // console.log(err);
          response(false);
        }
        res.clearCookie(COOKIE_NAME);
        response(true);
      }),
    );
  }
}
