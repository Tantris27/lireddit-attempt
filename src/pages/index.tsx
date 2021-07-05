import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from './util/createUrqlClient';

const Index = () => {
  const [{ data }] = usePostsQuery({ variables: { limit: 10 } });
  return (
    <div>
      <h1
        style={{
          textAlign: 'center',
          margin: '10% 0',
          fontSize: '25px',
          fontWeight: 'bold',
        }}
      >
        Hello There{' '}
      </h1>

      {!data ? (
        <div
          style={{
            textAlign: 'center',
            margin: '10% 0',
            fontSize: '25px',
            fontWeight: 'bold',
          }}
        >
          ...loading
        </div>
      ) : (
        <Stack spacing={8}>
          {data.posts.map((post) => (
            <Box key={post.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>{post.text}</Text>
            </Box>
          ))}
        </Stack>
      )}
    </div>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
