import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService, type LoginRequest } from '@/modules/auth/api/auth.service';
import { useAuthContext } from '@/modules/auth/context';

const loginMutationFn = async (credentials: LoginRequest) => authService.login(credentials);

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuthContext();

  return useMutation({
    mutationFn: loginMutationFn,
    onSuccess: (response) => {
      const user = response.data?.user;
      const accessToken = response.data?.tokens?.accessToken;

      if (user && accessToken) {
        setSession({ user, accessToken });

        const redirect = new URLSearchParams(location.search).get('redirect');
        const defaultPath =
          user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard';

        navigate(redirect && redirect.startsWith('/') ? redirect : defaultPath, { replace: true });
      }
    },
  });
};
