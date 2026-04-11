import { useQuery } from '@tanstack/react-query';
import { jobsService, type GetJobsParams } from '../../jobs.service';

export const useJobsList = (params?: GetJobsParams) => {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobsService.fetchJobs(params),
  });
};
