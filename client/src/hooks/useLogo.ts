import { useState, useEffect } from 'react';
import { axiosClient, type ApiResponse } from '@/services/api';

interface LogoData {
  logoPath: string | null;
}

export function useLogo() {
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchLogo() {
      try {
        const response = await axiosClient.get<ApiResponse<LogoData>>('/admin/settings/logo');
        if (mounted) {
          setLogoPath(response.data.data?.logoPath || null);
        }
      } catch {
        if (mounted) {
          setLogoPath(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchLogo();

    return () => {
      mounted = false;
    };
  }, []);

  return { logoPath, isLoading };
}
