import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/modules/auth/api/auth.service';
import { useAuthContext } from '@/modules/auth/context';

const logoutMutationFn = async () => {
  await authService.logout();
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const { clearSession } = useAuthContext();

  return useMutation({
    mutationFn: logoutMutationFn,
    onSettled: () => {
      navigate('/', { replace: true });
      clearSession();
    },
  });
};
