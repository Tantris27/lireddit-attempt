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
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <Box>
        <IconButton
          icon={<ChevronUpIcon />}
          name="chevron-up"
          size="24px"
          aria-label="downvoteButton"
          onClick={() => vote({ postId: post.id, value: 1 })}
        />
      </Box>
      <Box>{post.points}</Box>
      <Box>
        <IconButton
          icon={<ChevronDownIcon />}
          aria-label="upvoteButton"
          name="chevron-down"
          size="30px"
          onClick={() => vote({ postId: post.id, value: -1 })}
        />
      </Box>
    </Flex>
  );
};

// export default withUrqlClient(createUrqlClient)(VoteSection);
