import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import { createClient, Provider } from 'urql';
import { Layout } from '../components/Layout';
import theme from '../theme';

const client = createClient({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include',
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Provider value={client}>
        <ChakraProvider resetCSS theme={theme}>
          <ColorModeProvider
            options={{
              useSystemColorMode: true,
            }}
          >
            <Component {...pageProps} />
          </ColorModeProvider>
        </ChakraProvider>
      </Provider>
    </Layout>
  );
}

export default MyApp;
