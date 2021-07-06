import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import next from 'next';
// eslint-disable-next-line unicorn/prefer-node-protocol
import path from 'path';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { _prod_, COOKIE_NAME } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

const main = async () => {
  const connection = await createConnection({
    type: 'postgres',
    database: 'lireddit',
    username: 'lireddit',
    password: 'lireddit',

    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname + '/migrations/*')],
    entities: [Post, User],
  });
  // console.log(connection);
  await connection.runMigrations();

  // Incase i need to delete Posts again
  // await Post.delete({});
  const dev = process.env.NODE_ENV !== 'production';
  const appNext = next({ dev });
  // const handle = appNext.getRequestHandler();
  appNext.prepare().then(async () => {
    const app = express();

    const redisStore = connectRedis(session);
    const redis = new Redis();
    app.use(
      cors({
        origin: 'http://localhost:3000',
        credentials: true,
      }),
    );
    app.use(
      session({
        name: COOKIE_NAME,
        store: new redisStore({
          client: redis,
          // disables TimeToLast so the session stays alive forever !!!Change Later!!!
          // disableTTL: true,
          disableTouch: true,
        }),
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 Years,
          httpOnly: true,
          sameSite: 'strict', // protection against Cross Site Scripting
          secure: _prod_,
        },
        saveUninitialized: false,
        secret: 'keyboard cat',
        resave: false,
      }),
    );

    const apolloApp = new ApolloServer({
      schema: await buildSchema({
        resolvers: [HelloResolver, PostResolver, UserResolver],
        validate: false,
      }),
      context: ({ req, res }) => ({ req, res, redis }),
    });
    apolloApp.applyMiddleware({
      app,
      cors: false,
    });

    // const post = orm.em.create(Post, { title: 'my first Post' });
    // await orm.em.persistAndFlush(post);

    app.listen(4000, () => {
      console.log('App started on http://Localhost:4000/graphql');
    });
  });
};

main();
