/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { stringifyVariables } from '@urql/core';
import { cacheExchange } from '@urql/exchange-graphcache';
import router from 'next/router';
import { resourceLimits } from 'node:worker_threads';
import { dedupExchange, Exchange, fetchExchange } from 'urql';
import { pipe, tap } from 'wonka';
import {
  ChangePasswordMutation,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from '../../generated/graphql';
import { NullArray, Resolver, Variables } from '../types';
import { betterUpdateQuery } from './betterUpdateQuery';

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
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
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

// export type MergeMode = 'before' | 'after';

// export interface PaginationParams {
//   cursorArgument?: string;
//   // limitArgument?: string;
//   mergeMode?: MergeMode;
// }

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    // allFields checks the cache for our queries
    const allFields = cache.inspectFields(entityKey);
    // fieldInfo selects the the right queries(Objects) with the field name (in this App 'posts')
    const fieldInfos = allFields.filter(
      (inf: { fieldName: any }) => inf.fieldName === fieldName,
    );
    console.log('fieldInfos:', fieldInfos);
    console.log('fieldInfos.length:', fieldInfos.length);
    const size = fieldInfos.length;
    // if ther is no data/ no right query its gonna return undefined
    if (size === 0) {
      return undefined;
    }
    const result: string[] = [];
    fieldInfos.forEach((fieldInfo: any) => {
      console.log('fieldInfo:', fieldInfo);
      const data = cache.resolveFieldByKey(
        entityKey,
        fieldInfo.fieldKey,
      ) as string[];
      result.push(...data);
    });
    return result;
    //   const visited = new Set();
    //   let result: NullArray<string> = [];
    //   let prevOffset: number | null = null;

    //   for (let i = 0; i < size; i++) {
    //     const { fieldKey, arguments: args } = fieldInfos[i];
    //     if (args === null || !compareArgs(fieldArgs, args)) {
    //       continue;
    //     }

    //     const links = cache.resolve(entityKey, fieldKey) as string[];
    //     const currentOffset = args[cursorArgument];

    //     if (
    //       links === null ||
    //       links.length === 0 ||
    //       typeof currentOffset !== 'number'
    //     ) {
    //       continue;
    //     }

    //     const tempResult: NullArray<string> = [];

    //     for (let j = 0; j < links.length; j++) {
    //       const link = links[j];
    //       if (visited.has(link)) continue;
    //       tempResult.push(link);
    //       visited.add(link);
    //     }

    //     if (
    //       (!prevOffset || currentOffset > prevOffset) ===
    //       (mergeMode === 'after')
    //     ) {
    //       result = [...result, ...tempResult];
    //     } else {
    //       result = [...tempResult, ...result];
    //     }

    //     prevOffset = currentOffset;
    //   }

    //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    //   if (hasCurrentPage) {
    //     return result;
    //   } else if (!(info as any).store.schema) {
    //     return undefined;
    //   } else {
    //     info.partial = true;
    //     return result;
    //   }
  };
};
