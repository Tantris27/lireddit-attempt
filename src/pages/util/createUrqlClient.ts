/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import router from 'next/router';
import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from 'urql';
import { pipe, tap } from 'wonka';
import {
  ChangePasswordMutation,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from '../../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    // allFields checks the cache for our queries
    const allFields = cache.inspectFields(entityKey);
    // fieldInfo selects the the right queries(Objects) with the field name (in this App 'posts')
    const fieldInfos = allFields.filter(
      (inf: { fieldName: string }) => inf.fieldName === fieldName,
    );
    const size = fieldInfos.length;
    // if there is no data/ no right query its gonna return undefined
    if (size === 0) {
      return undefined;
    }
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      'posts',
    );
    info.partial = !isItInTheCache;
    let hasMore = true;
    const result: string[] = [];
    fieldInfos.forEach((fieldInfo: any) => {
      const key = cache.resolve(entityKey, fieldInfo.fieldKey) as string;
      const data = cache.resolve(key, 'posts') as string[];
      const hasMoreField = cache.resolve(key, 'hasMore');
      if (!hasMoreField) {
        hasMore = hasMoreField as boolean;
      }
      result.push(...data);
    });
    return { __typename: 'PaginatedPosts', hasMore, posts: result };
  };
};

const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        if (error?.message.includes('integer:NaN')) {
          router.replace('/login');
        }
      }),
    );
  };

export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: { PaginatedPosts: () => null },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          vote: (_result, _args, cache, _info) => {
            console.log(cache.inspectFields('Query'));
            cache.invalidate('Query', 'posts', { limit: 25 });
          },
          createPost: (_result, _args, cache, _info) => {
            // console.log(cache.inspectFields('Query posts'));
            const allFields = cache.inspectFields('Query');
            const fieldInfos = allFields.filter(
              (inf: { fieldName: string }) => inf.fieldName === 'posts',
            );
            fieldInfos.forEach((fi) => {
              cache.invalidate('Query', 'posts', fi.arguments);
            });
            // cache.invalidate('Query', 'posts', {
            //   limit: 25,
            // });
          },
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
          changePassword: (result, _args, cache, _info) =>
            betterUpdateQuery<ChangePasswordMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              (queryResult, query) => {
                if (queryResult.changePassword.errors) {
                  return query;
                } else {
                  return {
                    me: queryResult.changePassword.user,
                  };
                }
              },
            ),
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
