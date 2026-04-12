import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/modules/auth/context';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useToast } from '@/contexts/ToastContext';
import { FullPageSpinner } from '@/components/ui';
import { useRef } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'ADMIN';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const { openLogin } = useAuthModal();
  const { showToast } = useToast();
  const location = useLocation();
  const hasShownToast = useRef(false);

  // Still rehydrating — never redirect prematurely
  if (isLoading) {
    return <FullPageSpinner message="جاري تحميل البيانات..." />;
  }

  // Not authenticated — save intended path, open login modal
  if (!isAuthenticated) {
    sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    openLogin();
    return <Navigate to="/" replace />;
  }

  // Authenticated but wrong role
  if (requiredRole && user?.role !== requiredRole) {
    if (!hasShownToast.current) {
      hasShownToast.current = true;
      showToast({ type: 'error', message: 'ليس لديك صلاحية للوصول إلى هذه الصفحة' });
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
