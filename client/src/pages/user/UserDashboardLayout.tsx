import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UserLayout, type UserPageKey } from '@/components/user/layout';
import { useLogoutMutation } from '@/modules/auth/api/mutations';

export default function UserDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  let activePage: UserPageKey = 'home';
  if (location.pathname.includes('/dashboard/jobs')) activePage = 'search';
  else if (location.pathname.includes('/dashboard/saved-jobs')) activePage = 'saved';
  else if (location.pathname.includes('/dashboard/auto-apply')) activePage = 'auto-apply';
  else if (location.pathname.includes('/dashboard/analysis')) activePage = 'analytics';
  else if (location.pathname.includes('/dashboard/settings')) activePage = 'settings';
  else if (location.pathname.includes('/dashboard/profile')) activePage = 'profile';

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleNavigate = (page: UserPageKey) => {
    setMobileSidebarOpen(false);

    switch (page) {
      case 'home':
        navigate('/dashboard');
        break;
      case 'search':
        navigate('/dashboard/jobs');
        break;
      case 'saved':
        navigate('/dashboard/saved-jobs');
        break;
      case 'auto-apply':
        navigate('/dashboard/auto-apply');
        break;
      case 'analytics':
        navigate('/dashboard/analysis');
        break;
      case 'settings':
        navigate('/dashboard/settings');
        break;
      case 'profile':
        navigate('/dashboard/profile');
        break;
    }
  };

  return (
    <UserLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      mobileSidebarOpen={mobileSidebarOpen}
      onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      onCloseSidebar={() => setMobileSidebarOpen(false)}
      savedCount={0}
      onLogout={() => logoutMutation.mutate()}
    >
      <Outlet />
    </UserLayout>
  );
}
