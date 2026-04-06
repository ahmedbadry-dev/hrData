import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import UserDashboardPage from '@/pages/user/UserDashboardPage';
import HomePage from '@/pages/HomePage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/admin', element: <AdminDashboardPage /> },
  { path: '/dashboard', element: <UserDashboardPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
