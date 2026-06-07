
import { Link } from 'react-router-dom';
import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

export default function HomeFooterSection() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles['footer-logo']}>
        <span>HR Data</span>
      </div>

      <div className={styles['footer-links']}>
        <Link className={styles['footer-link']} to="/privacy">
          سياسة الخصوصية
        </Link>
        <Link className={styles['footer-link']} to="/terms">
          الشروط والأحكام
        </Link>
        <a className={styles['footer-link']} href="mailto:support@hrdatasa.com">
          تواصل معنا
        </a>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'var(--warm)',
            lineHeight: '1.8',
            textAlign: 'center',
            direction: 'rtl',
          }}
        >
          <span>جميع الحقوق محفوظة لدى </span>
          <span style={{ display: 'inline-block', direction: 'ltr' }}>© 2026 HR Data </span>
        </p>
      </div>
    </footer>
  );
}
