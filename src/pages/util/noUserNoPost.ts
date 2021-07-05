/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useMeQuery } from '../../generated/graphql';

export const noUserNoPost = () => {
  const [{ data, fetching }] = useMeQuery();
  const router = useRouter();
  console.log(router);
  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace('/login?next=' + router.pathname);
    }
  }, [data, fetching, router]);
};
