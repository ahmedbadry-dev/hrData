import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/api/hooks/use-auth';
import { Spinner } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { data, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Spinner />
      </div>
    );
  }

  const isAuthenticated = data?.isAuthenticated ?? !!data?.user;

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`/?mode=login&redirect=${redirect}`} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
