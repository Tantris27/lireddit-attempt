import { Box, Button, Flex } from '@chakra-ui/react';
import { css } from '@emotion/core';
import { withUrqlClient } from 'next-urql';
import Link from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { createUrqlClient } from '../pages/util/createUrqlClient';
import { isServer } from '../pages/util/isServer';

const boxStyle = css`
  background-color: #9ae6b4;
  padding: 8px;
  border-bottom: solid 1px black;
  border-top: solid 1px black;
  z-index: 1;
  position: sticky;
  top: 0;
`;
const linkStyle = css`
  margin: 8px 15px 8px;
  font-weight: 500;
  :hover {
    color: whitesmoke;
    margin: 8px 15px 7px;
    border-bottom: 1px solid whitesmoke;
    cursor: pointer;
  }
`;
const linkStyle2 = css`
  margin: 8px 10px 8px auto;
  font-weight: 500;
  :hover {
    color: whitesmoke;
    cursor: pointer;
    margin: 8px 15px 7px auto;
    border-bottom: 1px solid whitesmoke;
  }
`;
const linkStyle3 = css`
  margin: 8px 15px 8px;
  font-weight: 500;
  :hover {
    color: whitesmoke;
    cursor: pointer;
    margin: 8px 15px 7px;
    border-bottom: 1px solid whitesmoke;
  }
`;
// Comment for Branch
const buttonStyle = css`
  font-weight: 500;
  color: grey;
  margin-right: 10px;
  :hover {
    color: #9b2c2c;
    cursor: pointer;
  }
`;

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({ pause: isServer() });
  let body = null;
  // data loads
  if (fetching) {
  }
  // user not logged in
  else if (!data?.me) {
    // console.log(data);
    body = (
      <>
        {' '}
        <Link href="/login">
          <a css={linkStyle2}>Login</a>
        </Link>
        <Link href="/register">
          <a css={linkStyle3}>Register</a>
        </Link>
      </>
    );
  }
  // user logged in
  else {
    // Will lead to the UserPage
    body = (
      <>
        <Link href="/">
          <a css={linkStyle2}>{data.me.username}</a>
        </Link>
        <Button
          css={buttonStyle}
          colorScheme="tomato"
          isLoading={logoutFetching}
          onClick={async () => await logout()}
        >
          Logout
        </Button>
      </>
    );
  }
  return (
    <Box css={boxStyle}>
      <Flex>
        {' '}
        <Link href="/">
          <a css={linkStyle}>Home</a>
        </Link>
        <Link href="/create-post">
          <a css={linkStyle}>Post</a>
        </Link>
        {body}
      </Flex>
    </Box>
  );
};
export default withUrqlClient(createUrqlClient)(Navbar);
