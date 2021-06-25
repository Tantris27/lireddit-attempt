import { Navbar } from './Navbar';

interface LayoutProps {}

export const Layout: React.FC<LayoutProps> = ({ ...props }) => {
  return (
    <>
      <Navbar />
      <div>{props.children}</div>
    </>
  );
};
