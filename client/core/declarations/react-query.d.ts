import '@tanstack/react-query';
import { AxiosError } from 'axios';

type QueryKeys = ['applications', ...ReadonlyArray<unknown>];

type MutationKeys = ['applications', ...ReadonlyArray<unknown>];

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AxiosError;
    queryKey: QueryKeys;
    mutationKey: MutationKeys;
  }
}
