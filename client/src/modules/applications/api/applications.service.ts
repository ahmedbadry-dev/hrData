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
  const cvData = payload.cv ? await fileToBase64(payload.cv) : undefined;

  const body: Record<string, unknown> = {
    jobIds: payload.jobIds,
    sendTime: payload.sendTime,
    delayBetweenEmails: payload.delayBetweenEmails,
  };

  if (payload.cv && cvData) {
    body.cv = {
      name: payload.cv.name,
      type: payload.cv.type,
      size: payload.cv.size,
      data: cvData,
    };
  }

  const { data } = await axiosClient.post<ApiResponse<ScheduleApplicationsResponse>>(
    '/applications/schedule',
    body
  );
  return data;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const cancelApplication = async (id: string): Promise<void> => {
  await axiosClient.delete(`/applications/${id}`);
};
