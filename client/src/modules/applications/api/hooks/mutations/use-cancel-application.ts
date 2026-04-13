import { useMutation, useQueryClient, mutationOptions } from '@tanstack/react-query';
import { cancelApplication } from '../../applications.service';
import type { UseMutationOptions as CustomUseMutationOptions } from '@/lib/react-query/types';

export const useCancelApplicationMutationOptions = () => {
  return mutationOptions({
    mutationFn: cancelApplication,
  });
};

export type UseCancelApplicationMutationOptions = CustomUseMutationOptions<
  typeof useCancelApplicationMutationOptions
>;

export const UseCancelApplication = (options?: UseCancelApplicationMutationOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    ...useCancelApplicationMutationOptions(),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'list'] });
      options?.onSuccess?.(...args);
    },
  });
};
