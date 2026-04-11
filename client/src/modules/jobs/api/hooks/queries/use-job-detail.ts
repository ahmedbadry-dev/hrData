import { useQuery } from '@tanstack/react-query';
import { jobsService } from '../../jobs.service';

export const useJobDetail = (id: string) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsService.fetchJobById(id),
    enabled: !!id,
  });
};
