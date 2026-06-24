import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

const GOOGLE_DATA_POINTS = [
  {
    title: 'ربط اختياري وآمن',
    body: 'يربط المستخدم حساب Google اختيارياً من إعدادات حسابه، ويمكنه فصل الربط وحذف رموز الوصول في أي وقت.',
  },
  {
    title: 'إرسال طلبات التقديم',
    body: 'نستخدم صلاحية Gmail Send فقط عندما يختار المستخدم إرسال طلب توظيف إلى جهة العمل المحددة.',
  },
  {
    title: 'استخدام محدود للبيانات',
    body: 'لا يقرأ HR Data صندوق بريدك، ولا يعدل أو يحذف رسائلك، ولا يستخدم بيانات Google للإعلانات أو لأي غرض غير متعلق بطلبات التوظيف.',
  },
];

export default function HomeGoogleDataSection() {
  return (
    <section className={styles.section} id="google-data">
      <span className={styles['section-tag']}>عن المنصة وبيانات جوجل</span>
      <h2 className={styles['section-title']}>ما هي HR Data وكيف تستخدم Gmail؟</h2>
      <div className={styles['google-data-layout']}>
        <div className={`${styles['steps-grid']} ${styles['google-data-points']}`}>
          {GOOGLE_DATA_POINTS.map((point, index) => (
            <div className={`${styles.step} ${styles.reveal}`} key={point.title}>
              <div className={styles['step-num']}>{String(index + 1).padStart(2, '0')}</div>
              <div className={styles['step-accent']} />
              <div className={styles['step-title']}>{point.title}</div>
              <div className={styles['step-body']}>{point.body}</div>
            </div>
          ))}
        </div>
        <div className={`${styles['google-data-intro']} ${styles.reveal}`}>
          <p>
            HR Data منصة سعودية للبحث عن الوظائف والتقديم عليها. تساعد الباحثين عن عمل على تصفح
            الوظائف، حفظ الفرص المناسبة، وإرسال طلبات التقديم التي يختارونها مباشرة إلى أصحاب العمل.
          </p>
          <p>
            ربط Gmail اختياري تماماً. عند اختيار المستخدم إرسال طلب توظيف، يطلب HR Data صلاحية Gmail
            API الوحيدة <code>gmail.send</code> لإرسال رسالة التقديم بالنيابة عنه إلى جهة العمل التي
            اختارها. لا تمنح هذه الصلاحية التطبيق إمكانية قراءة صندوق البريد أو تعديل الرسائل أو
            حذفها.
          </p>
          <p className={styles['google-data-en']} lang="en" dir="ltr">
            HR Data is a Saudi job-search and job-application platform. Users can browse and save
            job listings, then optionally connect Gmail to send applications they choose directly to
            employers. The only Gmail API permission HR Data requests is <code>gmail.send</code>,
            which is used to send those user-requested application emails. It cannot read, modify,
            or delete inbox messages and does not use Google user data for advertising or unrelated
            purposes.
          </p>
          <a className={styles['google-data-link']} href="https://hrdatasa.com/privacy">
            اقرأ سياسة الخصوصية وكيفية استخدام بيانات Google
          </a>
        </div>
      </div>
    </section>
  );
}
