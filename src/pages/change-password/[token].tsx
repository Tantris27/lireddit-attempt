import { Box } from '@chakra-ui/core';
import { Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { NextComponentType, withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { InputField } from '../../components/inputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../util/createUrqlClient';
import { toErrorMap } from '../util/toErrorMap';

// eslint-disable-next-line @typescript-eslint/naming-convention
const ChangePassword: NextPage<{ token: string }> = () => {
  const [, changePassword] = useChangePasswordMutation();
  const router = useRouter();
  const [tokenError, setTokenError] = useState('');
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token:
              typeof router.query.token === 'string' ? router.query.token : '',
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ('token' in errorMap) {
              setTokenError(errorMap.token);
            } else {
              setErrors(errorMap);
            }
          } else if (response.data?.changePassword.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            />
            {tokenError ? (
              <Flex>
                <Box mr={2} style={{ color: 'red' }}>
                  {tokenError}
                </Box>
                <Link>
                  <NextLink href="/forgot-password">
                    Send a new Request
                  </NextLink>
                </Link>
              </Flex>
            ) : null}
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

export default withUrqlClient(createUrqlClient)(
  ChangePassword as NextComponentType,
);
