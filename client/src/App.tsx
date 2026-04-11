import AppRoutes from './AppRoutes';
import AuthModals from '@/components/auth/AuthModals';
import '@/styles/global.css';

export default function App() {
  return (
    <>
      <AppRoutes />
      <AuthModals />
    </>
  );
}
