import { axiosClient, type ApiResponse } from '@/services/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: Tokens;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
}

const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const { data } = await axiosClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
  return data;
};

const register = async (userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
  const { data } = await axiosClient.post<ApiResponse<RegisterResponse>>(
    '/auth/register',
    userData
  );
  return data;
};

const logout = async (): Promise<ApiResponse<{ message: string }>> => {
  const { data } = await axiosClient.post<ApiResponse<{ message: string }>>('/auth/logout');
  return data;
};

const refresh = async (): Promise<ApiResponse<{ user: User; tokens: Tokens }>> => {
  const { data } =
    await axiosClient.post<ApiResponse<{ user: User; tokens: Tokens }>>('/auth/refresh');
  return data;
};

export const authService = {
  login,
  register,
  logout,
  refresh,
};
