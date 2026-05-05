import { useQuery } from '@tanstack/react-query';
import { axiosClient, type ApiResponse } from '@/services/api';

interface LogoData {
  logoPath: string | null;
}

const logoQueryKey = ['admin', 'settings', 'logo'] as const;

export function useLogo() {
  const { data, isLoading } = useQuery({
    queryKey: logoQueryKey,
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<LogoData>>('/admin/settings/logo');
      return response.data.data?.logoPath ?? null;
    },
    staleTime: Infinity,
  });

  return { logoPath: data ?? null, isLoading };
}

export const logoKeys = {
  all: logoQueryKey,
};
