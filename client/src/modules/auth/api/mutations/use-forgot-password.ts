import { useMutation } from '@tanstack/react-query';
import { authService, type ForgotPasswordRequest } from '@/modules/auth/api/auth.service';

const forgotPasswordMutationFn = async (payload: ForgotPasswordRequest) => {
  return authService.forgotPassword(payload);
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: forgotPasswordMutationFn,
  });
};
