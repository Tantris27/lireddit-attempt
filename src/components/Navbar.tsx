import { Box, Flex } from '@chakra-ui/react';
import { css } from '@emotion/core';
import Link from 'next/link';

const boxStyle = css`
  background-color: #9ae6b4;
  padding: 8px;
`;
const linkStyle = css`
  margin: 8px 15px 4px;
  font-weight: 500;
  :hover {
    color: whitesmoke;
    cursor: pointer;
  }
`;
const linkStyle2 = css`
  margin: 8px 15px 4px auto;
  font-weight: 500;
  :hover {
    color: whitesmoke;
    cursor: pointer;
  }
`;
const linkStyle3 = css`
  margin: 8px 15px 8px;
  font-weight: 500;
  :hover {
    color: whitesmoke;
    cursor: pointer;
  }
`;

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  return (
    <Box css={boxStyle}>
      <Flex>
        {' '}
        <Link href="/">
          <a css={linkStyle}>Home</a>
        </Link>
        <Link href="/login">
          <a css={linkStyle2}>Login</a>
        </Link>
        <Link href="/register">
          <a css={linkStyle3}>Register</a>
        </Link>
      </Flex>
    </Box>
  );
};
