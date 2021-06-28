import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import { Layout } from '../components/Layout';
import theme from '../theme';

function MyApp({ Component, pageProps }: AppProps) {
  return (
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
  );
}

export default MyApp;
