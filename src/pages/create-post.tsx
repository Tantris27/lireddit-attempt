import { Box } from '@chakra-ui/core';
import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/inputField';
import { Wrapper } from '../components/Wrapper';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { createUrqlClient } from './util/createUrqlClient';
import { noUserNoPost } from './util/noUserNoPost';

interface CreatePostProps {}

const CreatePost: React.FC<CreatePostProps> = () => {
  const router = useRouter();
  noUserNoPost();

  const [, createPost] = useCreatePostMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ title: '', text: '' }}
        // Enter validation
        onSubmit={async (values) => {
          const { error } = await createPost({ input: values });
          console.log(error);
          if (!error) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <Box mt={4}>
              <InputField
                name="text"
                placeholder="text..."
                label="Body"
                textarea
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default withUrqlClient(createUrqlClient)(CreatePost);
