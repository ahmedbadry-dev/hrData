import { useMutation } from '@tanstack/react-query';
import { authService, type ResetPasswordRequest } from '@/modules/auth/api/auth.service';

interface ResetPasswordPayload {
  token: string;
  payload: ResetPasswordRequest;
}

const resetPasswordMutationFn = async ({ token, payload }: ResetPasswordPayload) => {
  return authService.resetPassword(token, payload);
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: resetPasswordMutationFn,
  });
};
