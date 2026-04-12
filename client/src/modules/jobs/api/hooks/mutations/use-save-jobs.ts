import { useMutation, useQueryClient } from '@tanstack/react-query';

import { jobsService } from '../../jobs.service';

export const useSaveJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobIds: string[]) => jobsService.saveJobs(jobIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });
};
