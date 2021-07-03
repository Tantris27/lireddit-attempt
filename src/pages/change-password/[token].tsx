import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import router from 'next/router';
import { InputField } from '../../components/inputField';
import { Wrapper } from '../../components/Wrapper';
import login from '../login';
import { toErrorMap } from '../util/toErrorMap';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  return (
    <>
      <div>token is {token}</div>
      <Wrapper variant="small">
        <Formik
          initialValues={{ newPassword: '' }}
          onSubmit={async (values, { setErrors }) => {
            //     const response = await login(values);
            //     if (response.data?.login.errors) {
            //       console.log(response.data.login.errors);
            //       setErrors(toErrorMap(response.data.login.errors));
            //     } else if (response.data?.login.user) {
            //       router.push('/');
            //     }
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
    </>
  );
};
ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default ChangePassword;
