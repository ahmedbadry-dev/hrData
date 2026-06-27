import { axiosClient } from '@/services/api';
import type { ScraperLog } from '@/components/admin/sections/adminData';
import type { AdminScraperStatus } from './types';

export const fetchScraperStatus = async (): Promise<{ data: AdminScraperStatus }> => {
  const { data } = await axiosClient.get('/admin/scraper/status');
  return data;
};

export const fetchScraperLogs = async (): Promise<{ data: ScraperLog[] }> => {
  const { data } = await axiosClient.get('/admin/scraper/logs');
  return data;
};
