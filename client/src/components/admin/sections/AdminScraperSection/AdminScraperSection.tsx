import type { ScraperLog } from '@/components/admin/sections/adminData';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import type {
  AdminScraperStatus,
  ScraperSourceState,
  ScraperSourceStatus,
} from '@/modules/admin/scraper/api/types';
import styles from './AdminScraperSection.module.css';

const SOURCE_STATE_LABELS: Record<ScraperSourceState, string> = {
  PENDING: 'لم يعمل بعد',
  RUNNING: 'قيد التشغيل',
  ACTIVE: 'نشط',
  NO_DATA: 'لا توجد بيانات',
  FAILED: 'فشل',
  STALE: 'غير مؤكد',
  DISABLED: 'متوقف',
};

const SOURCE_STATE_CLASS_NAMES: Record<ScraperSourceState, string> = {
  PENDING: styles.sourcePending,
  RUNNING: styles.sourceRunning,
  ACTIVE: styles.sourceActive,
  NO_DATA: styles.sourceNoData,
  FAILED: styles.sourceFailed,
  STALE: styles.sourceStale,
  DISABLED: styles.sourceDisabled,
};

const formatDuration = (durationMs: number | null) => {
  if (!durationMs) return null;
  return `${(durationMs / 1000).toFixed(1)} ثانية`;
};

const getSourceLastSeen = (source: ScraperSourceStatus) => {
  const dateValue =
    source.state === 'RUNNING'
      ? (source.lastStartedAt ?? source.lastFinishedAt)
      : (source.lastFinishedAt ?? source.lastStartedAt);
  return dateValue ? new Date(dateValue).toLocaleString('ar-SA') : 'لم يعمل بعد';
};

interface AdminScraperSectionProps {
  status: AdminScraperStatus;
  totalJobs: number | undefined;
  activeSources: number;
  nextRuns: string[];
  onStart: () => void;
  onStop: () => void;
  onRunNow: () => void;
  onResetQueue: () => void;
  scraperLogs: ScraperLog[];
  scraperSources: ScraperSourceStatus[];
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
  const cardStateClass = status.isRunning
    ? status.workerHealthy
      ? styles.running
      : styles.warning
    : styles.stopped;
  const scraperStatusText = status.isRunning
    ? status.workerHealthy
      ? '● شغال'
      : '● غير مؤكد'
    : '○ متوقف';
  const scraperStatusDescription = status.isRunning
    ? status.workerHealthy
      ? 'السكرابر يعمل تلقائياً حسب الجدول الزمني'
      : 'السكرابر مجدول لكن حالة العامل غير مؤكدة'
    : 'السكرابر متوقف - لا يتم جمع بيانات حالياً';

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

      <div className={cn(styles['scraper-card'], cardStateClass)}>
        <div className={styles['scraper-head']}>
          <div className={styles['status-col']}>
            <div className={styles['status-mini']}>الحالة الحالية</div>
            <div className={cn(styles['scraper-status-big'], cardStateClass)}>
              {scraperStatusText}
            </div>
            <div className={styles['status-desc']}>{scraperStatusDescription}</div>
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
                <b>
                  {activeSources} / {scraperSources.length}
                </b>
              </div>
              <div className={styles['kpi-row']}>
                <span>حالة العامل</span>
                <b>{status.workerHealthy ? 'متصل' : 'غير مؤكد'}</b>
              </div>
              <div className={styles['kpi-row']}>
                <span>الطابور</span>
                <b>
                  {status.queue.waiting} انتظار / {status.queue.active} نشط / {status.queue.failed}{' '}
                  فشل
                </b>
              </div>
              <div className={styles['kpi-row']}>
                <span>التشغيل القادم</span>
                <b>
                  {nextRuns.map((time) => (
                    <span key={time}>{time} </span>
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
          {scraperSources.length === 0 ? (
            <div className={styles.emptySources}>لا توجد مصادر مسجلة حالياً</div>
          ) : (
            scraperSources.map((source) => {
              const stateClassName = SOURCE_STATE_CLASS_NAMES[source.state];
              const duration = formatDuration(source.durationMs);

              return (
                <div key={source.sourceName} className={cn(styles.sourceRow, stateClassName)}>
                  <div className={styles.sourceRight}>
                    <span className={styles.sourceDot}></span>
                    <div className={styles.sourceText}>
                      <span className={styles.sourceName}>{source.displayName}</span>
                      <span className={styles.sourceStats}>
                        {source.linksFound} رابط / {source.jobsScraped} وظيفة
                        {duration ? ` - ${duration}` : ''}
                      </span>
                      {source.lastError ? (
                        <span className={styles.sourceError} title={source.lastError}>
                          {source.lastError}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className={styles.sourceLeft}>
                    <span className={styles.sourceUpdated}>{getSourceLastSeen(source)}</span>
                    <span className={styles.sourceBadge}>{SOURCE_STATE_LABELS[source.state]}</span>
                  </div>
                </div>
              );
            })
          )}
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
                    {log.jobsScraped > 0 && ' وتم تسجيلها في قاعدة البيانات'}
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
