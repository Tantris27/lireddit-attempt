import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import next from 'next';
import redis from 'redis';
import { buildSchema } from 'type-graphql';
import { _prod_, COOKIE_NAME } from './constants';
import mikroConfig from './mikro-orm.config';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';

// import { sendEmail } from './utils/sendEmail';

// import { Post } from './entities/Post';

const main = async () => {
  // sendEmail('bob@bob.com', 'hello there');
  // Calles the Database through mikro-orm with the variables set in the config
  const orm = await MikroORM.init(mikroConfig);
  // ?????
  await orm.getMigrator().up();

  const dev = process.env.NODE_ENV !== 'production';
  const appNext = next({ dev });
  // const handle = appNext.getRequestHandler();
  appNext.prepare().then(async () => {
    const app = express();

    const redisStore = connectRedis(session);
    const redisClient = redis.createClient();
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
          client: redisClient,
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
      context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
    });
    apolloApp.applyMiddleware({
      app,
      cors: false,
    });

    // const post = orm.em.create(Post, { title: 'my first Post' });
    // await orm.em.persistAndFlush(post);

    app.listen(4000, () => {
      console.log('App started on http://Localhost:4000');
    });
  });
};

main();
