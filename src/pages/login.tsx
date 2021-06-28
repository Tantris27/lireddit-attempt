import { Box } from '@chakra-ui/core';
import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/inputField';
import { Wrapper } from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { createUrqlClient } from './util/createUrqlClient';
import { toErrorMap } from './util/toErrorMap';

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [, login] = useLoginMutation();
  const router = useRouter();
  return (
    <Wrapper variant="small">
      {/* <h1>Login</h1> */}
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ options: values });
          if (response.data?.login.errors) {
            console.log(response.data.login.errors);
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default withUrqlClient(createUrqlClient)(Login);
