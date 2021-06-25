import { css, Global } from '@emotion/react';
import { Navbar } from './Navbar';

interface LayoutProps {}

export const Layout: React.FC<LayoutProps> = ({ ...props }) => {
  return (
    <>
      <Global
        styles={css`
          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }
        `}
      />
      <Navbar />
      <div>{props.children}</div>
    </>
  );
};
