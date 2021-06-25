/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import { Cache, cacheExchange, QueryInput } from '@urql/exchange-graphcache';
import { AppProps } from 'next/app';
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import { Layout } from '../components/Layout';
import {
  LoginMutation,
  meDocument,
  MeQuery,
  RegisterMutation,
} from '../generated/graphql';
import theme from '../theme';

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  queryInput: QueryInput,
  queryResult: any,
  updateFunction: (functionResult: Result, query: Query) => Query,
) {
  return cache.updateQuery(
    queryInput,
    (data) => updateFunction(queryResult, data as any) as any,
  );
}
const client = createClient({
  url: 'http://localhost:4000/graphql',
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          login: (result, args, cache, info) =>
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: meDocument },
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
          register: (result, args, cache, info) =>
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: meDocument },
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
    fetchExchange,
  ],
  fetchOptions: {
    credentials: 'include',
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <Layout>
        <ChakraProvider resetCSS theme={theme}>
          <ColorModeProvider
            options={{
              useSystemColorMode: true,
            }}
          >
            <Component {...pageProps} />
          </ColorModeProvider>
        </ChakraProvider>
      </Layout>
    </Provider>
  );
}

export default MyApp;
