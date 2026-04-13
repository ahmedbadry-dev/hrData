import { useMutation, useQueryClient, mutationOptions } from '@tanstack/react-query';
import { jobsService } from '../../jobs.service';
import type { UseMutationOptions as CustomUseMutationOptions } from '@/lib/react-query/types';

export const useSaveJobMutationOptions = () => {
  return mutationOptions({
    mutationFn: (jobId: string) => jobsService.saveJob(jobId),
  });
};

export type UseSaveJobMutationOptions = CustomUseMutationOptions<typeof useSaveJobMutationOptions>;

export const useSaveJob = (options?: UseSaveJobMutationOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    ...useSaveJobMutationOptions(),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs', 'list'] });
      options?.onSuccess?.(...args);
    },
  });
};
