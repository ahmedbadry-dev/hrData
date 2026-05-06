import type { ScraperLog } from '@/components/admin/sections/adminData';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import styles from './AdminScraperSection.module.css';

interface AdminScraperSectionProps {
  status: { isRunning: boolean; lastRun: string | null };
  totalJobs: number | undefined;
  activeSources: number;
  nextRuns: string[];
  onStart: () => void;
  onStop: () => void;
  onRunNow: () => void;
  onResetQueue: () => void;
  scraperLogs: ScraperLog[];
  scraperSources: string[];
}

export default function AdminScraperSection({
  status,
  totalJobs,
  activeSources,
  nextRuns,
  onStart,
  onStop,
  onRunNow,
  onResetQueue,
  scraperLogs,
  scraperSources,
}: AdminScraperSectionProps) {
  const { showToast } = useToast();

  const handleRunNow = () => {
    onRunNow();
    showToast({
      message: 'تم بدء عملية سحب الوظائف يدوياً بنجاح',
      type: 'success',
    });
  };

  const handleReset = () => {
    onResetQueue();
    showToast({
      message: 'تم تصفير طابور المهام وإيقاف كافة العمليات الجارية',
      type: 'info',
    });
  };

  return (
    <section>
      <PageHeader
        eyebrow="السكراب"
        title="إدارة السكراب"
        eyebrowClassName={styles['section-eyebrow']}
        titleClassName={styles['section-headline']}
      />

      <div
        className={cn(styles['scraper-card'], status.isRunning ? styles.running : styles.stopped)}
      >
        <div className={styles['scraper-head']}>
          <div className={styles['status-col']}>
            <div className={styles['status-mini']}>الحالة الحالية</div>
            <div
              className={cn(
                styles['scraper-status-big'],
                status.isRunning ? styles.running : styles.stopped
              )}
            >
              {status.isRunning ? '● شغال' : '○ متوقف'}
            </div>
            <div className={styles['status-desc']}>
              {status.isRunning
                ? 'السكراب يعمل تلقائياً — حسب الجدول الزمني'
                : 'السكراب متوقف — لا يتم جمع بيانات حالياً'}
            </div>
          </div>

          <div className={styles['control-col']}>
            <div className={styles['btn-group']}>
              <Button
                className={cn(
                  styles['toggle-scraper-btn'],
                  status.isRunning ? styles.stop : styles.start
                )}
                onClick={status.isRunning ? onStop : onStart}
              >
                {status.isRunning ? 'إيقاف السكراب' : 'تشغيل السكراب'}
              </Button>
              <Button onClick={handleRunNow} variant="secondary">
                تشغيل الآن
              </Button>
              <Button className={styles['reset-btn']} onClick={handleReset} variant="ghost">
                إنهاء كافة العمليات
              </Button>
            </div>

            <div className={styles['scraper-kpis']}>
              <div className={styles['kpi-row']}>
                <span>آخر تشغيل</span>
                <b>
                  {status.lastRun
                    ? new Date(status.lastRun).toLocaleString('ar-SA')
                    : 'لم يتم التشغيل بعد'}
                </b>
              </div>
              <div className={styles['kpi-row']}>
                <span>الوظائف المجموعة</span>
                <b>{totalJobs ?? '...'}</b>
              </div>
              <div className={styles['kpi-row']}>
                <span>المصادر النشطة</span>
                <b>{activeSources}</b>
              </div>
              <div className={styles['kpi-row']}>
                <span>التشغيل القادم</span>
                <b>
                  {nextRuns.map((time, i) => (
                    <b key={i}>{time}&nbsp;&nbsp; &nbsp;</b>
                  ))}
                </b>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles['chart-box']}>
        <div className={styles['chart-header']}>
          <div className={styles['chart-title']}>مصادر السكراب</div>
        </div>

        <div className={styles.sourcesList}>
          {scraperSources.map((source) => (
            <div key={source} className={styles.sourceRow}>
              <div className={styles.sourceRight}>
                <span className={styles.sourceDot}></span>
                <span className={styles.sourceName}>{source}</span>
              </div>
              <div className={styles.sourceLeft}>
                <span className={styles.sourceBadge}>نشط</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles['chart-box']}>
        <div className={styles['chart-header']}>
          <div className={styles['chart-title']}>سجل العمليات</div>
        </div>

        <div className={styles['scraper-log-box']}>
          {scraperLogs.length === 0 ? (
            <div className={styles['log-line-gray']}>لا توجد سجلات حالياً</div>
          ) : (
            scraperLogs.map((log) => (
              <div
                className={cn(
                  styles.logEntry,
                  log.status === 'SUCCESS' ? styles['log-line-green'] : styles['log-line-red']
                )}
                key={log.id}
              >
                <span className={styles.logTime}>
                  [{new Date(log.createdAt).toLocaleTimeString('ar-SA')}]
                </span>{' '}
                <span className={styles.logSite}>{log.siteName}</span>:{' '}
                {log.status === 'SUCCESS' ? (
                  <>
                    تم العثور على {log.linksFound} رابط واستخراج {log.jobsScraped} وظيفة
                    {log.jobsScraped > 0 && ' وتم تسجيل في قواعد البيانات'}
                    {log.duration ? ` (${(log.duration / 1000).toFixed(1)} ثانية)` : ''}
                  </>
                ) : (
                  <span className={styles.logError}>فشل: {log.errorMessage}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
