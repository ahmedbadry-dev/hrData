import { useMutation, useQueryClient } from '@tanstack/react-query';

import { jobsService } from '../../jobs.service';

export const useUnsaveJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobIds: string[]) => jobsService.unsaveJobs(jobIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });
};
