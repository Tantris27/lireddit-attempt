import { Box } from '@chakra-ui/core';

// import { css } from '@emotion/core';

// const boxStyle = css`
//   max-width: '800px';
//   /* width: 100%; */
//   margin: 8px auto 0;
// `;
interface WrapperProps {
  variant: 'small' | 'regular';
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  variant = 'regular',
}) => {
  return (
    <Box
      // css={boxStyle}
      style={{ margin: '8px auto 0px', width: '100%' }}
      maxW={variant === 'regular' ? '800px' : '400px'}
    >
      {children}
    </Box>
  );
};
