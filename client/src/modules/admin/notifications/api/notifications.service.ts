import { axiosClient } from '@/services/api';
import type { AdminNotification, CreateNotificationRequest, PaginatedNotifications } from './types';

export const fetchNotificationsList = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: PaginatedNotifications }> => {
  const { data } = await axiosClient.get('/admin/notifications', { params });
  return data;
};

export const createNotification = async (
  body: CreateNotificationRequest
): Promise<{ data: AdminNotification }> => {
  const { data } = await axiosClient.post('/admin/notifications/create', body);
  return data;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await axiosClient.delete(`/admin/notifications/${id}`);
};
