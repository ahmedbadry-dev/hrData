type Fn = (...args: any[]) => Promise<any> | any;

export type UseQueryOptions<TQueryOptionsFn extends Fn> = Omit<
  ReturnType<TQueryOptionsFn>,
  'queryKey' | 'queryFn'
>;

export type UseMutationOptions<TMutationOptionsFn extends Fn> = Omit<
  ReturnType<TMutationOptionsFn>,
  'mutationFn'
>;
