import { Link } from 'react-router-dom';
import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

const GOOGLE_DATA_POINTS = [
  {
    title: 'ربط اختياري وآمن',
    body: 'يربط المستخدم حساب Google فقط عند تفعيل ميزة التقديم عبر البريد من داخل حسابه.',
  },
  {
    title: 'إرسال طلبات التقديم',
    body: 'نستخدم صلاحية Gmail Send لإرسال رسائل التقديم إلى جهات التوظيف بالنيابة عن المستخدم وبموافقته.',
  },
  {
    title: 'استخدام محدود للبيانات',
    body: 'لا يقرأ HR Data صندوق بريدك، ولا يحذف رسائلك، ولا يشارك بيانات Google الخاصة بك خارج رسالة التقديم التي تختار إرسالها.',
  },
];

export default function HomeGoogleDataSection() {
  return (
    <section className={styles.section} id="google-data">
      <span className={styles['section-tag']}>بيانات جوجل</span>
      <h2 className={styles['section-title']}>كيف نستخدم Google و Gmail؟</h2>
      <div className={styles['google-data-layout']}>
        <div className={styles['google-data-intro']}>
          <p>
            HR Data يساعد الباحثين عن عمل على اكتشاف الوظائف، حفظ الفرص المناسبة، وإرسال طلبات
            التقديم إلى أصحاب العمل مباشرة عبر البريد الإلكتروني.
          </p>
          <p>
            عند اختيارك ربط Gmail، يطلب التطبيق إذنا محدودا لإرسال رسائل التقديم فقط. هذا الربط
            اختياري ويستخدم لتشغيل ميزة التقديم عبر البريد، ولا يمنح التطبيق صلاحية قراءة بريدك أو
            إدارة رسائلك.
          </p>
          <p className={styles['google-data-en']}>
            HR Data is a Saudi Arabian job search and direct-apply platform. Users can browse job
            listings and optionally connect their Gmail account to send job applications directly to
            employers. The app requests only the <code>gmail.send</code> permission — it never reads,
            stores, or shares inbox messages.
          </p>
          <Link className={styles['google-data-link']} to="/privacy">
            اقرأ سياسة الخصوصية
          </Link>
        </div>
        <div className={styles['google-data-points']}>
          {GOOGLE_DATA_POINTS.map((point, index) => (
            <div className={styles['google-data-step']} key={point.title}>
              <div className={styles['step-num']}>{String(index + 1).padStart(2, '0')}</div>
              <div className={styles['step-accent']} />
              <div className={styles['step-title']}>{point.title}</div>
              <div className={styles['step-body']}>{point.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
