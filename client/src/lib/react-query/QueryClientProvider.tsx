import { DefaultOptions, QueryClient } from '@tanstack/react-query';
import { QueryClientProvider as _QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

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

interface QueryClientProviderProps {
  children: ReactNode;
}

export const QueryClientProvider: React.FC<QueryClientProviderProps> = ({ children }) => {
  return (
    <_QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </_QueryClientProvider>
  );
};
