import { axiosClient, type ApiResponse } from '@/services/api';

export interface Cv {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  isDefault: boolean;
  createdAt: string;
}

export const uploadCv = async (file: File, isDefault?: boolean): Promise<ApiResponse<Cv>> => {
  const formData = new FormData();
  formData.append('file', file);
  if (isDefault) {
    formData.append('isDefault', 'true');
  }

  const { data } = await axiosClient.post<ApiResponse<Cv>>('/cvs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const fetchCvs = async (): Promise<ApiResponse<Cv[]>> => {
  const { data } = await axiosClient.get<ApiResponse<Cv[]>>('/cvs');
  return data;
};

export const deleteCv = async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
  const { data } = await axiosClient.delete<ApiResponse<{ success: boolean }>>(`/cvs/${id}`);
  return data;
};

export const setDefaultCv = async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
  const { data } = await axiosClient.patch<ApiResponse<{ success: boolean }>>(`/cvs/${id}/default`);
  return data;
};

export const cvsService = {
  uploadCv,
  fetchCvs,
  deleteCv,
  setDefaultCv,
};
