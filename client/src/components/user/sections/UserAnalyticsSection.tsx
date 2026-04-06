import type { UserApplication } from './userData';
import styles from './UserAnalyticsSection.module.css';

interface UserAnalyticsSectionProps {
  applications: UserApplication[];
}

const statusColors: Record<UserApplication['status'], { color: string; text: string }> = {
  pending: { color: '#b8860b', text: 'قيد الإرسال' },
  sent: { color: '#1a6b4a', text: 'تم الإرسال' },
  opened: { color: '#1a6b4a', text: 'تم الفتح' },
  replied: { color: '#c0392b', text: 'تم الرد' },
  failed: { color: '#c0392b', text: 'فشل الإرسال' },
};

export default function UserAnalyticsSection({ applications }: UserAnalyticsSectionProps) {
  if (applications.length === 0) {
    return (
      <section>
        <div className={styles['section-headline']}>التحليلات والتتبع</div>
        <div className={styles['welcome-state']}>
          <div className={styles['big-number']}>◐</div>
          <p>لا توجد بيانات تتبع بعد</p>
          <p className={styles['hint']}>استخدم "التقديم الآلي" لإرسال طلباتك ومتابعتها هنا</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className={styles['section-headline']}>التحليلات والتتبع</div>
      <div className={styles['control-bar']}>
        <span className={styles['count-label']}>{applications.length} طلب مرسل</span>
      </div>

      <div className={styles['results-list']}>
        {applications.map((app, index) => {
          const status = statusColors[app.status] ?? statusColors.pending;
          const dateStr = new Date(app.date).toLocaleDateString('ar-SA');

          return (
            <div className={styles['job-card']} style={{ animationDelay: `${index * 0.08}s` }} key={`${app.company}-${app.role}-${app.date}`}>
              <div className={styles['card-top']}>
                <div className={styles['card-main']}>
                  <div className={styles['company-tag']}>{app.company}</div>
                  <h2 className={styles['job-title']}>{app.role}</h2>
                  <div className={styles['meta-row']}>
                    <span className={styles['meta-chip']}>🎓 {app.major}</span>
                    <span className={styles['meta-chip']}>📍 {app.city}</span>
                    <span className={styles['meta-chip']}>📅 {dateStr}</span>
                  </div>
                </div>

                <div
                  className={styles['status-box']}
                  style={{ background: `${status.color}15`, borderColor: status.color }}
                >
                  <div style={{ color: status.color }}>{status.text}</div>
                </div>
              </div>

              <div className={styles['card-email']}>
                <span className={styles['email-hint']}>أرسلت إلى</span>
                <span className={styles['email-link']}>{app.email}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
