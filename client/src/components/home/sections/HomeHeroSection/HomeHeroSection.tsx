import { useNavigate } from 'react-router-dom';
import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useAuthContext } from '@/modules/auth/context';

export default function HomeHeroSection() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const { isAuthenticated, isLoading } = useAuthContext();

  const handleStartSearch = () => {
    if (isLoading) return;

    if (isAuthenticated) {
      navigate('/dashboard/jobs');
    } else {
      sessionStorage.setItem('redirectAfterLogin', '/dashboard/jobs');
      openLogin();
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles['hero-left']}>
        <div className={styles['hero-eyebrow']}>منصة التوظيف المباشر</div>
        <h1 className={styles['hero-headline']}>
          وظّف
          <br />
          <em>الكفاءات</em>
          <br />
          مباشرةً
        </h1>
        <p className={styles['hero-body']}>
          كُفُـؤ تربطك بأصحاب العمل مباشرةً عبر البريد الإلكتروني — بدون وسيط، بدون رسوم، بدون
          تعقيد. أرسل سيرتك الذاتية وانتظر ردهم.
        </p>
        <div className={styles['hero-cta-row']}>
          <button className={styles['btn-primary']} onClick={handleStartSearch}>
            ابدأ البحث الآن
          </button>
          <a className={styles['btn-ghost']} href="#how">
            كيف يعمل؟
          </a>
        </div>
        <div className={styles['hero-stat-strip']}>
          <div>
            <div className={styles['hero-stat-num']}>٢٠+</div>
            <div className={styles['hero-stat-label']}>وظيفة متاحة</div>
          </div>
          <div>
            <div className={styles['hero-stat-num']}>١٠</div>
            <div className={styles['hero-stat-label']}>شركة مشاركة</div>
          </div>
          <div>
            <div className={styles['hero-stat-num']}>١٠٠٪</div>
            <div className={styles['hero-stat-label']}>تواصل مباشر</div>
          </div>
        </div>
      </div>

      <div className={styles['hero-right']}>
        <div className={styles['hero-stamp']}>
          توظيف
          <br />
          مباشر
          <br />
          ٢٠٢٦
        </div>
        <div>
          <div className={styles['hero-card-preview']}>
            <div className={styles['hcp-tag']}>أرامكو السعودية</div>
            <div className={styles['hcp-title']}>مهندس برمجيات</div>
            <div className={styles['hcp-meta']}>📍 الظهران · 🎓 علوم حاسب</div>
            <div className={styles['hcp-email']}>📧 jobs@aramco.com</div>
          </div>
          <div className={styles['hero-card-preview']}>
            <div className={styles['hcp-tag']}>مجموعة شاكر</div>
            <div className={styles['hcp-title']}>أخصائي مبيعات</div>
            <div className={styles['hcp-meta']}>📍 الرياض · 🎓 إدارة أعمال</div>
            <div className={styles['hcp-email']}>📧 recruitment@shaker.com</div>
          </div>
          <div className={styles['hero-card-preview']}>
            <div className={styles['hcp-tag']}>شركة نيوم</div>
            <div className={styles['hcp-title']}>مدير مشاريع</div>
            <div className={styles['hcp-meta']}>📍 تبوك · 🎓 هندسة مدنية</div>
            <div className={styles['hcp-email']}>📧 careers@neom.com</div>
          </div>
          <div className={styles['hero-card-preview']}>
            <div className={styles['hcp-tag']}>مصرف الراجحي</div>
            <div className={styles['hcp-title']}>محلل مالي</div>
            <div className={styles['hcp-meta']}>📍 جدة · 🎓 مالية ومحاسبة</div>
            <div className={styles['hcp-email']}>📧 careers@alrajhibank.com.sa</div>
          </div>
        </div>
      </div>
    </section>
  );
}
