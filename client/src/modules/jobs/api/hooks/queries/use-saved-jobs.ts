import { useQuery } from '@tanstack/react-query';
import { jobsService, type GetJobsParams } from '../../jobs.service';

export const useSavedJobs = (params?: GetJobsParams) => {
  return useQuery({
    queryKey: ['saved-jobs', params],
    queryFn: () => jobsService.fetchSavedJobs(params),
  });
};
