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

export interface GmailStatusResponse {
  connected: boolean;
  email: string | null;
}

export interface GmailAuthUrlResponse {
  authUrl: string;
}

export interface Tokens {
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
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

const verifyEmail = async (token: string): Promise<ApiResponse<User>> => {
  const { data } = await axiosClient.post<ApiResponse<User>>(
    `/auth/verify-email?token=${encodeURIComponent(token)}`
  );
  return data;
};

const forgotPassword = async (
  payload: ForgotPasswordRequest
): Promise<ApiResponse<{ message: string }>> => {
  const { data } = await axiosClient.post<ApiResponse<{ message: string }>>(
    '/auth/forgot-password',
    payload
  );
  return data;
};

const resetPassword = async (
  token: string,
  payload: ResetPasswordRequest
): Promise<ApiResponse<{ user: User }>> => {
  const { data } = await axiosClient.post<ApiResponse<{ user: User }>>(
    `/auth/reset-password?token=${encodeURIComponent(token)}`,
    payload
  );
  return data;
};

const validateResetToken = async (
  token: string
): Promise<ApiResponse<{ valid: boolean }>> => {
  const { data } = await axiosClient.get<ApiResponse<{ valid: boolean }>>(
    `/auth/validate-reset-token?token=${encodeURIComponent(token)}`
  );
  return data;
};

const getGmailStatus = async (): Promise<ApiResponse<GmailStatusResponse>> => {
  const { data } = await axiosClient.get<ApiResponse<GmailStatusResponse>>('/gmail/status');
  return data;
};

const getGmailAuthUrl = async (): Promise<ApiResponse<GmailAuthUrlResponse>> => {
  const { data } = await axiosClient.get<ApiResponse<GmailAuthUrlResponse>>('/gmail/auth-url');
  return data;
};

const disconnectGmail = async (): Promise<ApiResponse<{ connected: boolean }>> => {
  const { data } =
    await axiosClient.delete<ApiResponse<{ connected: boolean }>>('/gmail/disconnect');
  return data;
};

export const authService = {
  login,
  register,
  logout,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  validateResetToken,
  getGmailStatus,
  getGmailAuthUrl,
  disconnectGmail,
};
