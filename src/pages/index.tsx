import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { Wrapper } from '../components/Wrapper';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from './util/createUrqlClient';

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({ variables: { limit: 10 } });
  if (!fetching && !data) {
    return <div>For some Reason there are no Posts</div>;
  }
  return (
    <Wrapper variant="regular">
      <Flex mt={10} mb={10}>
        <Heading>RedditClone</Heading>
        <NextLink href="/create-post">
          <Link ml="auto" fontSize={20} fontWeight={400}>
            Post
          </Link>
        </NextLink>
      </Flex>

      {fetching && !data ? (
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
        <>
          <Stack spacing={8}>
            {data!.posts.map((post) => (
              <Box key={post.id} p={5} shadow="md" borderWidth="1px">
                <Heading fontSize="xl">{post.title}</Heading>
                <Text mt={4}>{post.textSnippet}</Text>
              </Box>
            ))}
          </Stack>
          {/* Maybe put button in separate conditional renderin  for just(data) */}
          <Flex>
            <Button m="auto" my={8} isLoading={fetching}>
              Load More Posts
            </Button>{' '}
          </Flex>
        </>
      )}
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
