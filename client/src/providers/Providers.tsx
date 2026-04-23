import { HelmetProvider } from 'react-helmet-async';
import { type ReactNode } from 'react';
import { QueryClientProvider } from '@/lib/react-query/QueryClientProvider';
import { ToastProvider } from '@/contexts/ToastContext';
import { Toast } from '@/components/common';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { AuthProvider } from '@/modules/auth/context';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <HelmetProvider>
      <QueryClientProvider>
        <AuthProvider>
          <ToastProvider>
            <Toast />
            <AuthModalProvider>{children}</AuthModalProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};
