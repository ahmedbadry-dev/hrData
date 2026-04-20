import { useMutation, mutationOptions } from '@tanstack/react-query';
import { jobsService } from '../../jobs.service';
import type { UseMutationOptions as CustomUseMutationOptions } from '@/lib/react-query/types';

export const useUnsaveJobsMutationOptions = () => {
  return mutationOptions({
    mutationFn: (jobIds?: string[]) => jobsService.unsaveJobs(jobIds),
  });
};

export type UseUnsaveJobsMutationOptions = CustomUseMutationOptions<
  typeof useUnsaveJobsMutationOptions
>;

export const useUnsaveJobs = (options?: UseUnsaveJobsMutationOptions) => {
  return useMutation({
    ...useUnsaveJobsMutationOptions(),
    ...options,
  });
};
