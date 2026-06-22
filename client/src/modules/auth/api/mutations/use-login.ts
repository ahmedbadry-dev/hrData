import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, type LoginRequest } from '@/modules/auth/api/auth.service';
import { useAuthContext } from '@/modules/auth/context';
import { useToast } from '@/contexts/ToastContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { ALLOWED_ADMIN_ROLES } from '@/constants/enums';

const loginMutationFn = async (credentials: LoginRequest) => authService.login(credentials);

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const { setSession } = useAuthContext();
  const { showToast } = useToast();
  const { closeAll } = useAuthModal();

  return useMutation({
    mutationFn: loginMutationFn,
    onSuccess: (response) => {
      const user = response.data?.user;
      const accessToken = response.data?.tokens?.accessToken;

      if (user && accessToken) {
        setSession({ user, accessToken });
        closeAll();

        showToast({ type: 'success', message: 'مرحباً بك! تم تسجيل دخولك بنجاح' });

        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');

        const defaultPath = ALLOWED_ADMIN_ROLES.includes(user.role) ? '/admin' : '/dashboard';
        const targetPath =
          redirectPath && redirectPath !== '/' && redirectPath.startsWith('/')
            ? redirectPath
            : defaultPath;

        navigate(targetPath, {
          replace: true,
        });
      }
    },
  });
};
