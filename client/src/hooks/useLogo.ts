import { useQuery } from '@tanstack/react-query';
import { axiosClient, API_BASE_URL, type ApiResponse } from '@/services/api';

interface LogoData {
  logoPath: string | null;
}

const logoQueryKey = ['admin', 'settings', 'logo'] as const;

export function useLogo() {
  const { data, isLoading } = useQuery({
    queryKey: logoQueryKey,
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<LogoData>>('/admin/settings/logo');
      const rawPath = response.data.data?.logoPath ?? null;
      if (!rawPath) return null;
      if (rawPath.startsWith('http')) return rawPath;

      const base = API_BASE_URL.replace(/\/$/, '');
      const pathCleaned = rawPath.replace(/^\//, '');
      return `${base}/${pathCleaned}`;
    },
    staleTime: Infinity,
  });

  return { logoPath: data ?? null, isLoading };
}

export const logoKeys = {
  all: logoQueryKey,
};
