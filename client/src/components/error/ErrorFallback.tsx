import { useNavigate } from 'react-router-dom';
import { FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui';

export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    resetErrorBoundary();
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: '#1e293b',
          borderRadius: '20px',
          padding: '48px 32px',
          textAlign: 'center',
          border: '1px solid #334155',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.50)',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 24px',
            background: 'rgba(239, 68, 68, 0.10)',
            border: '1px solid rgba(239, 68, 68, 0.30)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
          }}
        >
          ⚠️
        </div>

        <h1
          style={{
            color: '#f8fafc',
            fontSize: '22px',
            fontWeight: '700',
            marginBottom: '12px',
          }}
        >
          حدث خطأ ما
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '24px', lineHeight: '1.6' }}>
          {(error as Error)?.message || 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={handleReload}>
            إعادة تحميل
          </Button>
          <Button onClick={handleGoHome}>العودة للرئيسية</Button>
        </div>
      </div>
    </div>
  );
}
