import { axiosClient, type ApiResponse } from '@/services/api';
import type {
  ApplicationsQuota,
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

export const scheduleApplication = async (
  payload: ScheduleApplicationsRequest
): Promise<ApiResponse<ScheduleApplicationsResponse>> => {
  const formData = new FormData();

  formData.append('jobIds', JSON.stringify(payload.jobIds));
  formData.append('sendTime', payload.sendTime);
  formData.append('delayBetweenEmails', String(payload.delayBetweenEmails));

  if (payload.cv) {
    formData.append('cv', payload.cv);
  }

  const { data } = await axiosClient.post<ApiResponse<ScheduleApplicationsResponse>>(
    '/applications/schedule',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data;
};

export const fetchApplicationsQuota = async (): Promise<ApiResponse<ApplicationsQuota>> => {
  const { data } = await axiosClient.get<ApiResponse<ApplicationsQuota>>('/applications/quota');
  return data;
};

export const cancelApplication = async (id: string): Promise<void> => {
  await axiosClient.delete(`/applications/${id}`);
};

export const fetchApplicationsStats = async (): Promise<
  ApiResponse<{ total: number; successful: number }>
> => {
  const { data } =
    await axiosClient.get<ApiResponse<{ total: number; successful: number }>>(
      '/applications/stats'
    );
  return data;
};
