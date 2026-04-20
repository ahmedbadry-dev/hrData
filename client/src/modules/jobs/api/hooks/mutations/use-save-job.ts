import { useMutation, mutationOptions } from '@tanstack/react-query';
import { jobsService } from '../../jobs.service';
import type { UseMutationOptions as CustomUseMutationOptions } from '@/lib/react-query/types';

export const useSaveJobMutationOptions = () => {
  return mutationOptions({
    mutationFn: (jobId: string) => jobsService.saveJob(jobId),
  });
};

export type UseSaveJobMutationOptions = CustomUseMutationOptions<typeof useSaveJobMutationOptions>;

export const useSaveJob = (options?: UseSaveJobMutationOptions) => {
  return useMutation({
    ...useSaveJobMutationOptions(),
    ...options,
  });
};
