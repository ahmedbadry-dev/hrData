import { useQuery } from '@tanstack/react-query';
import { fetchScraperLogs, fetchScraperStatus } from '../scraper.service';

export const ADMIN_SCRAPER_STATUS_QUERY_KEY = ['admin', 'scraper-status'] as const;
export const ADMIN_SCRAPER_LOGS_QUERY_KEY = ['admin', 'scraper-logs'] as const;

export const useScraperStatus = () => {
  return useQuery({
    queryKey: ADMIN_SCRAPER_STATUS_QUERY_KEY,
    queryFn: fetchScraperStatus,
    refetchInterval: 5000,
  });
};

export const useScraperLogs = () => {
  return useQuery({
    queryKey: ADMIN_SCRAPER_LOGS_QUERY_KEY,
    queryFn: fetchScraperLogs,
    refetchInterval: 10000,
  });
};
