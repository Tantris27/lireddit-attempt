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
import { useState } from 'react';
import { VoteSection } from '../components/voteSection';
import { Wrapper } from '../components/Wrapper';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from './util/createUrqlClient';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 25,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });
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
            {data!.posts.posts.map((post) => (
              <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
                <VoteSection post={post} />
                <Box>
                  {console.log('index.voteStatus', post.voteStatus)}
                  <Heading fontSize="xl">{post.title}</Heading>
                  <Text mt={4}> posted by {post.creator.username}</Text>
                  <Text mt={4}>{post.textSnippet}</Text>
                </Box>
              </Flex>
            ))}
          </Stack>
          {data && data.posts.hasMore ? (
            <Flex>
              <Button
                m="auto"
                my={8}
                isLoading={fetching}
                onClick={() => {
                  setVariables({
                    limit: variables.limit,
                    cursor:
                      data.posts.posts[data.posts.posts.length - 1].createdAt,
                  });
                }}
              >
                Load More Posts
              </Button>
            </Flex>
          ) : null}
        </>
      )}
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
