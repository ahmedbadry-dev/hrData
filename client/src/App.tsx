import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import UserDashboardPage from '@/pages/user/UserDashboardPage';
import HomePage from '@/pages/home/HomePage';
import NotFoundPage from '@/pages/error/NotFoundPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/admin', element: <AdminDashboardPage /> },
  { path: '/dashboard', element: <UserDashboardPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
