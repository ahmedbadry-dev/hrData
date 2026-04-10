import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminDashboardLayout from '@/pages/admin/AdminDashboardLayout';
import AdminHomePage from '@/pages/admin/AdminHomePage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminNotificationsPage from '@/pages/admin/AdminNotificationsPage';
import AdminScrapPage from '@/pages/admin/AdminScrapPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import UserDashboardLayout from '@/pages/user/UserDashboardLayout';
import DashboardHomePage from '@/pages/user/DashboardHomePage';
import DashboardJobsPage from '@/pages/user/DashboardJobsPage';
import DashboardSavedJobsPage from '@/pages/user/DashboardSavedJobsPage';
import DashboardAutoApplyPage from '@/pages/user/DashboardAutoApplyPage';
import DashboardAnalysisPage from '@/pages/user/DashboardAnalysisPage';
import DashboardSettingsPage from '@/pages/user/DashboardSettingsPage';

import HomePage from '@/pages/home/HomePage';
import NotFoundPage from '@/pages/error/NotFoundPage';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { 
    path: '/admin', 
    element: <AdminDashboardLayout />,
    children: [
      { index: true, element: <AdminHomePage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'analysis', element: <AdminAnalyticsPage /> },
      { path: 'notifications', element: <AdminNotificationsPage /> },
      { path: 'scrap', element: <AdminScrapPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ]
  },
  { 
    path: '/dashboard', 
    element: <UserDashboardLayout />,
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: 'jobs', element: <DashboardJobsPage /> },
      { path: 'saved-jobs', element: <DashboardSavedJobsPage /> },
      { path: 'auto-apply', element: <DashboardAutoApplyPage /> },
      { path: 'analysis', element: <DashboardAnalysisPage /> },
      { path: 'settings', element: <DashboardSettingsPage /> },
    ]
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
