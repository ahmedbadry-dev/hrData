import { useMutation, useQueryClient, mutationOptions } from '@tanstack/react-query';
import { jobsService } from '../../jobs.service';
import type { UseMutationOptions as CustomUseMutationOptions } from '@/lib/react-query/types';

export const useUnsaveJobMutationOptions = () => {
  return mutationOptions({
    mutationFn: (jobId: string) => jobsService.unsaveJob(jobId),
  });
};

export type UseUnsaveJobMutationOptions = CustomUseMutationOptions<
  typeof useUnsaveJobMutationOptions
>;

export const useUnsaveJob = (options?: UseUnsaveJobMutationOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    ...useUnsaveJobMutationOptions(),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs', 'list'] });
      options?.onSuccess?.(...args);
    },
  });
};
