import { useMutation, mutationOptions } from '@tanstack/react-query';
import { jobsService } from '../../jobs.service';
import type { UseMutationOptions as CustomUseMutationOptions } from '@/lib/react-query/types';

export const useSaveJobsMutationOptions = () => {
  return mutationOptions({
    mutationFn: (jobIds: string[]) => jobsService.saveJobs(jobIds),
  });
};

export type UseSaveJobsMutationOptions = CustomUseMutationOptions<
  typeof useSaveJobsMutationOptions
>;

export const useSaveJobs = (options?: UseSaveJobsMutationOptions) => {
  return useMutation({
    ...useSaveJobsMutationOptions(),
    ...options,
  });
};
