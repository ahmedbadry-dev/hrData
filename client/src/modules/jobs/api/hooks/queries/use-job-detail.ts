import { useQuery, queryOptions } from '@tanstack/react-query';
import { jobsService } from '../../jobs.service';

export const JOB_QUERY_KEY = ['job'] as const;

export const useJobDetailQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: [...JOB_QUERY_KEY, id] as const,
    queryFn: () => jobsService.fetchJobById(id),
    enabled: !!id,
  });
};

export const useJobDetail = (id: string) => {
  return useQuery(useJobDetailQueryOptions(id));
};
