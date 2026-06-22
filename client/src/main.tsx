import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Providers } from './providers/Providers';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import '@/styles/global.css';

const container = document.getElementById('root')!;

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Providers>
            <App />
          </Providers>
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);

container.innerHTML = '';
createRoot(container).render(app);
