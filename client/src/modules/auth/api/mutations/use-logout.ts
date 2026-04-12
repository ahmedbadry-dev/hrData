import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/modules/auth/api/auth.service';
import { useAuthContext } from '@/modules/auth/context';
import { useToast } from '@/contexts/ToastContext';
import { mapError } from '@/lib/error-mapper';

const logoutMutationFn = async () => {
  await authService.logout();
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const { clearSession } = useAuthContext();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: logoutMutationFn,
    onSuccess: () => {
      clearSession();
      navigate('/', { replace: true });
      showToast({ type: 'info', message: 'تم تسجيل خروجك بنجاح' });
    },
    onError: (error) => {
      // Still clear session on error — server might have already invalidated the token
      clearSession();
      navigate('/', { replace: true });
      showToast({ type: 'error', message: mapError(error) });
    },
  });
};
