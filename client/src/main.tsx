import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Providers } from './providers/Providers';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import '@/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Providers>
          <App />
        </Providers>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
