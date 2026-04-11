type Fn = (...args: any[]) => Promise<any> | any;

export type UseQueryOptions<TQueryOptionsFn extends Fn> = Omit<
  ReturnType<TQueryOptionsFn>,
  'queryKey' | 'queryFn'
>;

export type UseInfiniteQueryOptions<TInfiniteQueryOptionsFn extends Fn> = Omit<
  ReturnType<TInfiniteQueryOptionsFn>,
  'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
>;

export type UseMutationOptions<TMutationOptionsFn extends Fn> = Omit<
  ReturnType<TMutationOptionsFn>,
  'mutationFn'
>;
