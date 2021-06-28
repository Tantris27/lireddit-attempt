import { withUrqlClient } from 'next-urql';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from './util/createUrqlClient';

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <div>
      <h1
        style={{
          textAlign: 'center',
          margin: '10% 0',
          fontSize: '25px',
          fontWeight: 'bold',
        }}
      >
        Hello There{' '}
      </h1>

      {!data ? (
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
        data.posts.map((post) => (
          <div
            key={post.id}
            style={{
              textAlign: 'center',
              margin: '25px 0',
              fontSize: '20px',
            }}
          >
            {post.title}
          </div>
        ))
      )}
    </div>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
