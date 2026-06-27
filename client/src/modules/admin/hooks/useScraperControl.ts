import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@/services/api';
import {
  ADMIN_SCRAPER_LOGS_QUERY_KEY,
  ADMIN_SCRAPER_STATUS_QUERY_KEY,
} from '@/modules/admin/scraper/api/hooks/use-scraper';

export function useScraperControl() {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: () => axiosClient.post('/admin/scraper/start'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_SCRAPER_STATUS_QUERY_KEY }),
  });

  const stopMutation = useMutation({
    mutationFn: () => axiosClient.post('/admin/scraper/stop'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_SCRAPER_STATUS_QUERY_KEY }),
  });

  const runNowMutation = useMutation({
    mutationFn: () => axiosClient.post('/admin/scraper/run-now'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_SCRAPER_STATUS_QUERY_KEY }),
  });

  const resetQueueMutation = useMutation({
    mutationFn: () => axiosClient.post('/admin/scraper/reset-queue'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SCRAPER_STATUS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_SCRAPER_LOGS_QUERY_KEY });
    },
  });

  return { startMutation, stopMutation, runNowMutation, resetQueueMutation };
}
