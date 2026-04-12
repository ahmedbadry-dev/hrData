import { useMutation } from '@tanstack/react-query';
import { authService, type RegisterRequest } from '@/modules/auth/api/auth.service';

const registerMutationFn = async (userData: RegisterRequest) => {
  const response = await authService.register(userData);
  return response;
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: registerMutationFn,
  });
};
