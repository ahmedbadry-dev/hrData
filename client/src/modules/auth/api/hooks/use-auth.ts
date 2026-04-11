import { useQuery } from '@tanstack/react-query';
import { authService } from '../auth.service';
import { getAccessToken, setAccessToken } from '@/services/api';

export const useAuth = () => {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: ['auth', accessToken],
    queryFn: async () => {
      if (!accessToken) {
        const response = await authService.refresh();
        if (response.data?.tokens?.accessToken) {
          setAccessToken(response.data.tokens.accessToken);
        }
        return { user: response.data?.user ?? null, isAuthenticated: !!response.data?.user };
      }
      return {
        user: {
          id: 'temp',
          email: '',
          firstName: '',
          lastName: '',
          role: '',
          status: '',
          emailVerified: true,
          createdAt: '',
          updatedAt: '',
          fullName: '',
        },
        isAuthenticated: true,
      };
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
    throwOnError: false,
  });
};
