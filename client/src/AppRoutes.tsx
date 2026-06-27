import { Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { UserRole } from '@/constants/enums';

import AdminDashboardLayout from '@/pages/admin/AdminDashboardLayout';
import AdminHomePage from '@/pages/admin/AdminHomePage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminNotificationsPage from '@/pages/admin/AdminNotificationsPage';
import AdminScrapPage from '@/pages/admin/AdminScrapPage';
import UserDashboardLayout from '@/pages/user/UserDashboardLayout';
import DashboardHomePage from '@/pages/user/DashboardHomePage';
import DashboardJobsPage from '@/pages/user/DashboardJobsPage';
import DashboardSavedJobsPage from '@/pages/user/DashboardSavedJobsPage';
import DashboardAutoApplyPage from '@/pages/user/DashboardAutoApplyPage';
import DashboardAnalysisPage from '@/pages/user/DashboardAnalysisPage';
import DashboardSettingsPage from '@/pages/user/DashboardSettingsPage';
import DashboardProfilePage from '@/pages/user/DashboardProfilePage';

import HomePage from '@/pages/home/HomePage';
import NotFoundPage from '@/pages/error/NotFoundPage';
import PrivacyPage from '@/pages/privacy/PrivacyPage';
import TermsPage from '@/pages/terms/TermsPage';

import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected user routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole={UserRole.USER}>
            <UserDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHomePage />} />
        <Route path="jobs" element={<DashboardJobsPage />} />
        <Route path="saved-jobs" element={<DashboardSavedJobsPage />} />
        <Route path="auto-apply" element={<DashboardAutoApplyPage />} />
        <Route path="analysis" element={<DashboardAnalysisPage />} />
        <Route path="settings" element={<DashboardSettingsPage />} />
        <Route path="profile" element={<DashboardProfilePage />} />
      </Route>

      {/* Protected admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <AdminDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHomePage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="analysis" element={<AdminAnalyticsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="scrap" element={<AdminScrapPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
