import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, type RegisterRequest } from '@/modules/auth/api/auth.service';

const registerMutationFn = async (userData: RegisterRequest) => {
  const response = await authService.register(userData);
  return response;
};

export const useRegisterMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerMutationFn,
    onSuccess: () => {
      navigate('/login');
    },
  });
};
