import { EntityManager } from '@mikro-orm/core';
import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { Redis } from 'ioredis';

export type MyContext = {
  em: EntityManager<any> & EntityManager;
  req: Request & {
    session: Session & Partial<SessionData> & { userId?: number };
  };
  redis: Redis;
  res: Response;
};
