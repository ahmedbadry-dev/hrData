import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@/services/api';

export function useScraperControl() {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: () => axiosClient.post('/admin/scraper/start'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'scraper-status'] }),
  });

  const stopMutation = useMutation({
    mutationFn: () => axiosClient.post('/admin/scraper/stop'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'scraper-status'] }),
  });

  const runNowMutation = useMutation({
    mutationFn: () => axiosClient.post('/admin/scraper/run-now'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'scraper-status'] }),
  });

  return { startMutation, stopMutation, runNowMutation };
}
