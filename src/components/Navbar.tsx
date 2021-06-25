import { Box, Flex } from '@chakra-ui/react';
// import { css } from '@emotion/react';
import Link from 'next/link';

// const headerStyle = css`
//   background-color: 'tomato';
//   padding: 2px;
// `;

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  return (
    <Box>
      <Flex>
        {' '}
        <Link href="/">
          <a>Home</a>
        </Link>
        <Link href="/register">
          <a>Register</a>
        </Link>
        <Link href="/login">
          <a>Login</a>
        </Link>
      </Flex>
    </Box>
  );
};
