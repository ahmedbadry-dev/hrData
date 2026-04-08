import { useEffect, useState } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

export default function NotFoundPage() {
  const error = useRouteError();
  const [serverHtml, setServerHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServer404 = async () => {
      try {
        const response = await fetch('/api/v1/not-found', {
          method: 'GET',
          cache: 'no-store',
        });
        if (response.ok) {
          const html = await response.text();
          setServerHtml(html);
        }
      } catch {
        // Fallback to local 404
      } finally {
        setLoading(false);
      }
    };

    fetchServer404();
  }, []);

  if (loading) {
    return (
      <div style={styles.fallbackContainer}>
        <div style={styles.loading}>جاري التحميل...</div>
      </div>
    );
  }

  if (serverHtml) {
    return <div dangerouslySetInnerHTML={{ __html: serverHtml }} />;
  }

  const errorMessage = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'خطأ غير معروف';

  return (
    <div style={styles.fallbackContainer}>
      <h1 style={styles.title}>٤٠٤</h1>
      <p style={styles.subtitle}>الصفحة غير موجودة</p>
      <p style={styles.message}>
        {errorMessage || 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'}
      </p>
      <a href="/" style={styles.button}>
        العودة للرئيسية
      </a>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fallbackContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
    fontFamily: "'Segoe UI', 'Tahoma', sans-serif",
    color: '#fff',
    padding: '2rem',
  },
  loading: {
    color: '#888',
    fontSize: '1.2rem',
  },
  title: {
    fontSize: '8rem',
    fontWeight: 900,
    color: '#e74c3c',
    lineHeight: 1,
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#ccc',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1rem',
    color: '#888',
    marginBottom: '2rem',
    textAlign: 'center',
    maxWidth: '400px',
  },
  button: {
    display: 'inline-block',
    padding: '0.8rem 2rem',
    background: '#e74c3c',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'background 0.2s',
  },
};
