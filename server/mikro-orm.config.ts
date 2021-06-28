import { MikroORM } from '@mikro-orm/core';
// eslint-disable-next-line unicorn/prefer-node-protocol
import path from 'path';
import { _prod_ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';

// const __dirname = path.dirname(new URL(import.meta.url).pathname);
export default {
  dbName: 'lireddit',
  user: 'postgres',
  password: 'N1etzschesAffe27',
  debug: !_prod_,
  type: 'postgresql',
  entities: [Post, User],
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  // discovery: {
  //   tsConfigPath: '../tsconfig.json',
  // },
} as Parameters<typeof MikroORM.init>[0];
