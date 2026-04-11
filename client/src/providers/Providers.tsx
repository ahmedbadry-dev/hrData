import { type ReactNode } from 'react';
import { QueryClientProvider } from '@/lib/react-query/QueryClientProvider';
import { ToastProvider } from '@/contexts/ToastContext';
import { Toast } from '@/components/common';
import { AuthModalProvider } from '@/contexts/AuthModalContext';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryClientProvider>
      <ToastProvider>
        <Toast />
        <AuthModalProvider>{children}</AuthModalProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};
