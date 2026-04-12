import { axiosClient, type ApiResponse } from '@/services/api';
import type {
  Application,
  PaginatedApplications,
  ScheduleApplicationsRequest,
  ScheduleApplicationsResponse,
} from '../types';

export const fetchApplicationsList = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ApiResponse<PaginatedApplications>> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.status) searchParams.set('status', params.status);

  const { data } = await axiosClient.get<ApiResponse<PaginatedApplications>>(
    `/applications?${searchParams.toString()}`
  );
  return data;
};

export const fetchApplicationDetail = async (id: string): Promise<ApiResponse<Application>> => {
  const { data } = await axiosClient.get<ApiResponse<Application>>(`/applications/${id}`);
  return data;
};

export const scheduleApplication = async (
  payload: ScheduleApplicationsRequest
): Promise<ApiResponse<ScheduleApplicationsResponse>> => {
  const { data } = await axiosClient.post<ApiResponse<ScheduleApplicationsResponse>>(
    '/applications/schedule',
    payload
  );
  return data;
};

export const cancelApplication = async (id: string): Promise<void> => {
  await axiosClient.delete(`/applications/${id}`);
};

export const fetchApplicationCvFile = async (cvId: string): Promise<Blob> => {
  const response = await axiosClient.get(`/cvs/${cvId}/file`, {
    responseType: 'blob',
  });

  return response.data as Blob;
};
