import argon2 from 'argon2';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { COOKIE_NAME } from '../constants';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { validateRegister } from '../utils/validateRegister';

@InputType()
class UsernamePasswordInput {
  @Field(() => String)
  username!: string;
  @Field(() => String)
  email!: string;
  @Field(() => String)
  password!: string;
}
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
  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string, @Ctx() { em }: MyContext) {
    const user = await em.findOne(User, { email });
    console.log(user);
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
    const errors = await validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = await em.create(User, {
      username: options.username,
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
            field: 'username',
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
