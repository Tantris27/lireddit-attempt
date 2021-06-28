/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { cacheExchange } from '@urql/exchange-graphcache';
import { dedupExchange, fetchExchange } from 'urql';
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from '../../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';

export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logout: (result, _args, cache, _info) =>
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              () => ({ me: null }),
            ),
          login: (result, _args, cache, _info) =>
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              (queryResult, query) => {
                if (queryResult.login.errors) {
                  return query;
                } else {
                  return {
                    me: queryResult.login.user,
                  };
                }
              },
            ),
          register: (result, _args, cache, _info) =>
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              (queryResult, query) => {
                if (queryResult.register.errors) {
                  return query;
                } else {
                  return {
                    me: queryResult.register.user,
                  };
                }
              },
            ),
        },
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
});
