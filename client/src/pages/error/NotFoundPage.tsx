import { useRouteError } from 'react-router-dom';

export default function NotFoundPage() {
  useRouteError();

  return (
    <div style={styles.body}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}
      </style>
      
      <nav style={styles.navbar}>
        <a href="/" style={styles.logo}>
          كُفُ<span style={styles.logoAccent}>ـ</span>ؤ
        </a>
      </nav>

      <main style={styles.container}>
        <h1 style={styles.h1}>
          <span style={styles.accent}>٤٠٤</span>
        </h1>
        <h2 style={styles.h2}>الصفحة غير موجودة</h2>
        <p style={styles.p}>
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر. يمكنك العودة للرئيسية أو استكشاف الوظائف المتاحة.
        </p>
        <div style={styles.buttons}>
          <a href="/" style={styles.btnPrimary}>
            العودة للرئيسية
          </a>
        </div>
      </main>

      <div style={styles.noise} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    minHeight: '100vh',
    fontFamily: "'Cairo', sans-serif",
    backgroundColor: '#f5f0e8', // var(--paper)
    color: '#0d0d0d', // var(--ink)
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    direction: 'rtl',
  },
  noise: {
    content: "''",
    position: 'fixed',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: 'none',
    zIndex: 1000,
    opacity: 0.45,
  },
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#f5f0e8',
    borderBottom: '2px solid #0d0d0d',
    padding: '0 48px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 900,
    color: '#0d0d0d',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  logoAccent: {
    color: '#c0392b', // var(--accent)
    fontStyle: 'normal',
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 48px',
    textAlign: 'center',
  },
  h1: {
    fontSize: 'clamp(80px, 15vw, 140px)',
    fontWeight: 900,
    color: '#0d0d0d',
    lineHeight: 1,
    letterSpacing: '-4px',
  },
  accent: {
    color: '#c0392b',
    fontStyle: 'normal',
  },
  h2: {
    fontSize: 'clamp(24px, 3vw, 32px)',
    fontWeight: 700,
    margin: '24px 0 16px',
    color: '#0d0d0d',
  },
  p: {
    fontSize: '16px',
    color: '#a89880', // var(--muted)
    maxWidth: '500px',
    lineHeight: 1.8,
    marginBottom: '40px',
  },
  buttons: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  btnPrimary: {
    display: 'inline-block',
    padding: '16px 36px',
    fontSize: '15px',
    fontWeight: 700,
    textDecoration: 'none',
    borderRadius: '2px',
    background: '#0d0d0d',
    color: '#f5f0e8',
    border: '2px solid #0d0d0d',
    transition: 'all 0.25s',
  },
};

