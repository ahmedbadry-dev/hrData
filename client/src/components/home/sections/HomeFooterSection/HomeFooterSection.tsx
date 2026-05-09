import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

export default function HomeFooterSection() {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-logo']}>
        HR Data
      </div>
      <div
        style={{
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'var(--paper)',
            lineHeight: '1.8',
            textAlign: 'right',
          }}
        >
          <span>جميع الحقوق محفوظة لدى </span>
          <span style={{ display: 'inline-block', direction: 'ltr' }}>© 2026 HR Data </span>
        </p>
      </div>
      <div className={styles['footer-links']}>
        <a className={styles['footer-link']} href="#">
          سياسة الخصوصية
        </a>
        <a className={styles['footer-link']} href="#">
          الشروط والأحكام
        </a>
        <a className={styles['footer-link']} href="#">
          تواصل معنا
        </a>
      </div>
    </footer>
  );
}
