import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/modules/auth/context';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useToast } from '@/contexts/ToastContext';
import { FullPageSpinner } from '@/components/ui';
import { useRef } from 'react';
import { UserRole, ALLOWED_ADMIN_ROLES } from '@/constants/enums';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole.USER | UserRole.ADMIN;
}

const hasAccess = (userRole?: string, requiredRole?: string) => {
  if (!requiredRole) return true;
  if (!userRole) return false;
  if (requiredRole === UserRole.ADMIN) {
    return ALLOWED_ADMIN_ROLES.includes(userRole);
  }
  return userRole === requiredRole || ALLOWED_ADMIN_ROLES.includes(userRole);
};

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const { openLogin } = useAuthModal();
  const { showToast } = useToast();
  const location = useLocation();
  const hasShownToast = useRef(false);

  if (isLoading) {
    return <FullPageSpinner message="جاري تحميل البيانات..." />;
  }

  if (!isAuthenticated) {
    sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    openLogin();
    return <Navigate to="/" replace />;
  }

  if (!hasAccess(user?.role, requiredRole)) {
    if (!hasShownToast.current) {
      hasShownToast.current = true;
      showToast({ type: 'error', message: 'ليس لديك صلاحية للوصول إلى هذه الصفحة' });
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
