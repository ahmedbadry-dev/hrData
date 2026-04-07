import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

export default function HomeFooterSection() {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-logo']}>
        كُفُـؤ<em>.</em>
      </div>
      <div className={styles['footer-copy']}>© ٢٠٢٦ كُفُـؤ — جميع الحقوق محفوظة</div>
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
