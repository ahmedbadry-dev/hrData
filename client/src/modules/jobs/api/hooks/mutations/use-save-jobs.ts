import { useMutation, useQueryClient, mutationOptions } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  return useMutation({
    ...useSaveJobsMutationOptions(),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs', 'list'] });
      options?.onSuccess?.(...args);
    },
  });
};
