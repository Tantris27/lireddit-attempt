import { Cache, QueryInput } from '@urql/exchange-graphcache';

export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  queryInput: QueryInput,
  queryResult: any,
  updateFunction: (functionResult: Result, query: Query) => Query,
) {
  return cache.updateQuery(
    queryInput,
    (data) => updateFunction(queryResult, data as any) as any,
  );
}
