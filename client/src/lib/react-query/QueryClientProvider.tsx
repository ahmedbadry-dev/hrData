import { DefaultOptions, QueryClient } from '@tanstack/react-query';
import { QueryClientProvider as _QueryClientProvider } from '@tanstack/react-query';
import { lazy, ReactNode, Suspense } from 'react';

const defaultOptions = {
  queries: {
    staleTime: 1000 * 60,
  },
} satisfies DefaultOptions;

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions,
  });
};

export const queryClient = makeQueryClient();

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((module) => ({
        default: module.ReactQueryDevtools,
      }))
    )
  : null;

interface QueryClientProviderProps {
  children: ReactNode;
}

export const QueryClientProvider: React.FC<QueryClientProviderProps> = ({ children }) => {
  return (
    <_QueryClientProvider client={queryClient}>
      {children}
      {ReactQueryDevtools ? (
        <Suspense fallback={null}>
          <ReactQueryDevtools />
        </Suspense>
      ) : null}
    </_QueryClientProvider>
  );
};
