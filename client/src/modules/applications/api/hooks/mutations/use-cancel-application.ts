import { useMutation, useQueryClient, mutationOptions } from '@tanstack/react-query';
import { cancelApplication } from '../../applications.service';
import type { UseMutationOptions as CustomUseMutationOptions } from '@/lib/react-query/types';
import { applicationsQueryKeys, type ApplicationsListParams } from '../../applications.query-keys';

export const useCancelApplicationMutationOptions = () => {
  return mutationOptions({
    mutationFn: cancelApplication,
  });
};

export type UseCancelApplicationMutationOptions = CustomUseMutationOptions<
  typeof useCancelApplicationMutationOptions
>;

export const useCancelApplication = (
  options?: UseCancelApplicationMutationOptions,
  listQueryParams?: ApplicationsListParams
) => {
  const queryClient = useQueryClient();
  return useMutation({
    ...useCancelApplicationMutationOptions(),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: applicationsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: applicationsQueryKeys.quota });
      if (listQueryParams) {
        queryClient.invalidateQueries({
          queryKey: applicationsQueryKeys.list(listQueryParams),
        });
      }
      options?.onSuccess?.(...args);
    },
  });
};
