import type { ScraperLog } from '@/components/admin/sections/adminData';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminScraperSection.module.css';

interface AdminScraperSectionProps {
  status: { isRunning: boolean; lastRun: string | null };
  totalJobs: number | undefined;
  activeSources: number;
  nextRuns: string[];
  onStart: () => void;
  onStop: () => void;
  onRunNow: () => void;
  scraperLogs: ScraperLog[];
  onClearLog: () => void;
  onExportLog: () => void;
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
  scraperLogs,
  onClearLog,
  onExportLog,
  scraperSources,
}: AdminScraperSectionProps) {
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
              <Button onClick={onRunNow} variant="secondary">
                تشغيل الآن
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
          <div className={styles['log-actions']}>
            <Button onClick={onExportLog}>تصدير</Button>
            <Button onClick={onClearLog}>مسح</Button>
          </div>
        </div>

        <div className={styles['scraper-log-box']}>
          {scraperLogs.map((line) => (
            <div className={styles[`log-line-${line.t}`]} key={line.m}>
              {line.m}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
