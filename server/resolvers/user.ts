import argon2 from 'argon2';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { v4 } from 'uuid';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { sendEmail } from '../utils/sendEmail';
import { validateRegister } from '../utils/validateRegister';
import { UsernamePasswordInput } from './UsernamePasswordInput';

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

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // current User wants to see his own password
    if (req.session.userId === user.id) {
      return user.email;
    }
    // current User wants to see a foreign password
    return '';
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext,
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
    const user = await User.findOne(intId);
    if (!user) {
      return { errors: [{ field: 'token', message: "User doesn't exist" }] };
    }
    await User.update(
      { id: intId },
      { password: await argon2.hash(newPassword) },
    );
    // delete the token after completion (uncomment after testing)
    // redis.del(FORGET_PASSWORD_PREFIX + token);

    // log in the user
    req.session.userId = intId;
    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Ctx() { redis }: MyContext,
  ) {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } },
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
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }
  @Query(() => [User])
  users(): Promise<User[]> {
    return User.find();
  }
  @Mutation(() => UserResponse)
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    const reponse = validateRegister(options);
    const errors = await reponse;
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning('*')
        .execute();
      // console.log(result);
      user = result.raw[0];
      // user = result;
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

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail')
    usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext,
  ) {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } },
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
          response(false);
        }
        res.clearCookie(COOKIE_NAME);
        response(true);
      }),
    );
  }
}
