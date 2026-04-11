import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/modules/auth/api/auth.service';
import { removeAccessToken } from '@/services/api';

const logoutMutationFn = async () => {
  await authService.logout();
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutMutationFn,
    onSettled: () => {
      removeAccessToken();
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      navigate('/login');
    },
  });
};
