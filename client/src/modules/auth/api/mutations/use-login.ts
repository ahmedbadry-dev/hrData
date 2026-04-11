import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, type LoginRequest } from '@/modules/auth/api/auth.service';
import { setAccessToken } from '@/services/api';

const loginMutationFn = async (credentials: LoginRequest) => {
  const response = await authService.login(credentials);
  if (response.data?.tokens?.accessToken) {
    setAccessToken(response.data.tokens.accessToken);
  }
  return response;
};

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginMutationFn,
    onSuccess: (response) => {
      if (response.data?.user) {
        queryClient.invalidateQueries({ queryKey: ['auth'] });
        navigate('/dashboard');
      }
    },
  });
};
