import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <a href="/" className={styles.logo}>
          كُفُ<span className={styles.logoAccent}>ـ</span>ؤ
        </a>
      </nav>

      <main className={styles.container}>
        <h1 className={styles.heading}>
          <span className={styles.headingAccent}>٤٠٤</span>
        </h1>
        <h2 className={styles.subheading}>الصفحة غير موجودة</h2>
        <p className={styles.description}>
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر. يمكنك العودة للرئيسية أو
          استكشاف الوظائف المتاحة.
        </p>
        <div className={styles.buttons}>
          <a href="/" className={styles.btnPrimary}>
            العودة للرئيسية
          </a>
        </div>
      </main>
    </div>
  );
}
