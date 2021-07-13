import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton } from '@chakra-ui/react';
// import { withUrqlClient } from 'next-urql';
import { PostsQuery, useVoteMutation } from '../generated/graphql';

// import { createUrqlClient } from '../pages/util/createUrqlClient';

interface VoteSectionProps {
  post: PostsQuery['posts']['posts'][0];
}

export const VoteSection: React.FC<VoteSectionProps> = ({ post }) => {
  const [, vote] = useVoteMutation();
  // console.log(post.voteStatus);
  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      mr={4}
      // width="25px"
    >
      <Box>
        <IconButton
          icon={<ChevronUpIcon />}
          name="chevron-up"
          aria-label="downvoteButton"
          colorScheme="green"
          // {post.voteStatus === 1 ? 'green' : undefined}
          onClick={async () => {
            if (post.voteStatus === 1) {
              return;
            }
            await vote({ postId: post.id, value: 1 });
          }}
          size="sm"
          borderRadius="5px"
        />
      </Box>
      <Box marginTop="5px" marginBottom="5px">
        {post.points}
      </Box>
      <Box>
        <IconButton
          size="sm"
          icon={<ChevronDownIcon />}
          aria-label="upvoteButton"
          name="chevron-down"
          colorScheme="red"
          // {post.voteStatus === -1 ? 'red' : undefined}
          borderRadius="5px"
          onClick={async () => {
            if (post.voteStatus === -1) {
              return;
            }
            await vote({ postId: post.id, value: -1 });
          }}
        />
      </Box>
    </Flex>
  );
};

// export default withUrqlClient(createUrqlClient)(VoteSection);
