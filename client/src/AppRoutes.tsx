import { Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';

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
import { DashboardApplicationsPage } from '@/modules/applications/pages';
import DashboardAutoApplyPage from '@/pages/user/DashboardAutoApplyPage';
import DashboardAnalysisPage from '@/pages/user/DashboardAnalysisPage';
import DashboardSettingsPage from '@/pages/user/DashboardSettingsPage';

import HomePage from '@/pages/home/HomePage';
import NotFoundPage from '@/pages/error/NotFoundPage';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Public job search - no auth required, no save functionality */}
      {/* <Route path="/dashboard/jobs" element={<PublicJobsPage />} /> */}

      {/* Protected user routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHomePage />} />
        <Route path="jobs" element={<DashboardJobsPage />} />
        <Route path="saved-jobs" element={<DashboardSavedJobsPage />} />
        <Route path="applications" element={<DashboardApplicationsPage />} />
        <Route path="auto-apply" element={<DashboardAutoApplyPage />} />
        <Route path="analysis" element={<DashboardAnalysisPage />} />
        <Route path="settings" element={<DashboardSettingsPage />} />
      </Route>

      {/* Protected admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHomePage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="analysis" element={<AdminAnalyticsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="scrap" element={<AdminScrapPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
