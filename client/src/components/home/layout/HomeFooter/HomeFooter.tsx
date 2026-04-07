import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';
import { homeFooterLinks } from '@/components/home/sections/homeData';

export default function HomeFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-logo']}>
        كُفُـؤ<em>.</em>
      </div>
      <div className={styles['footer-copy']}>© ٢٠٢٦ كُفُـؤ — جميع الحقوق محفوظة</div>
      <div className={styles['footer-links']}>
        {homeFooterLinks.map((link) => (
          <a key={link.label} className={styles['footer-link']} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
