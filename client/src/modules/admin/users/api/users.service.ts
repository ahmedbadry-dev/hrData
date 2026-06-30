import { axiosClient } from '@/services/api';
import type {
  AdminUser,
  PaginatedUsers,
  RestoreUserQuotaRequest,
  RestoreUserQuotaResponse,
  UpdateUserRequest,
} from './types';

export const fetchUsersList = async (params?: {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
}): Promise<{ data: PaginatedUsers }> => {
  const { data } = await axiosClient.get('/admin/users', { params });
  return data;
};

export const fetchUserById = async (id: string): Promise<{ data: AdminUser }> => {
  const { data } = await axiosClient.get(`/admin/users/${id}`);
  return data;
};

export const updateUser = async (
  id: string,
  body: UpdateUserRequest
): Promise<{ data: AdminUser }> => {
  const { data } = await axiosClient.patch(`/admin/users/${id}`, body);
  return data;
};

export const suspendUser = async (id: string): Promise<{ data: AdminUser }> => {
  const { data } = await axiosClient.patch(`/admin/users/${id}/suspend`);
  return data;
};

export const activateUser = async (id: string): Promise<{ data: AdminUser }> => {
  const { data } = await axiosClient.patch(`/admin/users/${id}/activate`);
  return data;
};

export const restoreUserQuota = async (
  id: string,
  body: RestoreUserQuotaRequest
): Promise<{ data: RestoreUserQuotaResponse }> => {
  const { data } = await axiosClient.post(`/admin/users/${id}/quota-reset`, body);
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axiosClient.delete(`/admin/users/${id}`);
};
