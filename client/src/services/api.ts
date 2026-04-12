import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authService } from '@/modules/auth/api/auth.service';

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
  path: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: PaginationMeta;
}

export const API_BASE_URL = '/api/v1';
export const AUTH_REQUIRED_EVENT = 'auth:required';
export const CSRF_COOKIE_NAME = 'csrfToken';
export const CSRF_HEADER_NAME = 'x-csrf-token';

const NO_REFRESH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
];

let accessToken: string | null = null;

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const isAuthEndpointRequest = (url?: string): boolean => {
  if (!url) {
    return false;
  }

  return NO_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const emitAuthRequired = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
  }
};

const getCookieValue = (cookieName: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));

  if (!match || !match[1]) {
    return null;
  }

  return decodeURIComponent(match[1]);
};

const refreshToken = async (): Promise<boolean> => {
  if (isRefreshing) {
    return refreshPromise ?? Promise.resolve(false);
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await authService.refresh();
      if (response.data?.tokens?.accessToken) {
        setAccessToken(response.data.tokens.accessToken);
        return true;
      }
      return false;
    } catch {
      removeAccessToken();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = config.method?.toUpperCase();
  if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && config.headers) {
    const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
    if (csrfToken) {
      config.headers[CSRF_HEADER_NAME] = csrfToken;
    }
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest?.url;
    let shouldNotifyAuthRequired = false;

    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpointRequest(requestUrl);

    if (shouldAttemptRefresh) {
      originalRequest._retry = true;

      const refreshed = await refreshToken();
      if (refreshed && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${getAccessToken()}`;
        return axiosClient(originalRequest);
      }

      if (!isAuthEndpointRequest(requestUrl)) {
        shouldNotifyAuthRequired = true;
      }
    }

    if (error.response?.status === 401 && !isAuthEndpointRequest(requestUrl)) {
      shouldNotifyAuthRequired = true;
    }

    if (shouldNotifyAuthRequired) {
      removeAccessToken();
      emitAuthRequired();
    }

    return Promise.reject(error);
  }
);

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const removeAccessToken = () => {
  accessToken = null;
};
