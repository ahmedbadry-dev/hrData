import { useEffect, useState } from 'react';
import type { ScraperLog } from '@/components/admin/sections/adminData';
import { PageHeader } from '@/components/common';
import { Button, Input, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminScraperSection.module.css';

interface AdminScraperSectionProps {
  scraperRunning: boolean;
  scraperLogs: ScraperLog[];
  savedToken: string;
  tokenVisible: boolean;
  onSaveToken: (token: string) => void;
  onToggleTokenVisibility: () => void;
  onToggleScraper: () => void;
  onClearLog: () => void;
  onExportLog: () => void;
}

export default function AdminScraperSection({
  scraperRunning,
  scraperLogs,
  savedToken,
  tokenVisible,
  onSaveToken,
  onToggleTokenVisibility,
  onToggleScraper,
  onClearLog,
  onExportLog,
}: AdminScraperSectionProps) {
  const [tokenValue, setTokenValue] = useState(savedToken);

  useEffect(() => {
    setTokenValue(savedToken);
  }, [savedToken]);

  return (
    <section>
      <PageHeader
        eyebrow="السكراب"
        title="إدارة السكراب"
        eyebrowClassName={styles['section-eyebrow']}
        titleClassName={styles['section-headline']}
      />

      <div className={cn(styles['scraper-card'], scraperRunning ? styles.running : styles.stopped)}>
        <div className={styles['scraper-head']}>
          <div className={styles['status-col']}>
            <div className={styles['status-mini']}>الحالة الحالية</div>
            <div
              className={cn(
                styles['scraper-status-big'],
                scraperRunning ? styles.running : styles.stopped
              )}
            >
              {scraperRunning ? '● شغال' : '○ متوقف'}
            </div>
            <div className={styles['status-desc']}>
              {scraperRunning
                ? 'السكراب يعمل تلقائياً — كل ٣٠ دقيقة'
                : 'السكراب متوقف — لا يتم جمع بيانات'}
            </div>
          </div>

          <div>
            <Button
              className={cn(
                styles['toggle-scraper-btn'],
                scraperRunning ? styles.stop : styles.start
              )}
              onClick={onToggleScraper}
            >
              {scraperRunning ? 'إيقاف السكراب' : 'تشغيل السكراب'}
            </Button>
            <div className={styles['scraper-kpis']}>
              <div className={styles['kpi-row']}>
                <span>آخر تشغيل</span>
                <b>١٠:٤٢ ص</b>
              </div>
              <div className={styles['kpi-row']}>
                <span>الوظائف المجموعة</span>
                <b>١٣</b>
              </div>
              <div className={styles['kpi-row']}>
                <span>المصادر النشطة</span>
                <b>٣</b>
              </div>
              <div className={styles['kpi-row']}>
                <span>التشغيل القادم</span>
                <b>{scraperRunning ? '١١:١٢ ص' : '—'}</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles['api-token-box']}>
        <div className={styles['api-token-label']}>API Token — مفتاح الوصول</div>
        <div className={styles['token-hint']}>
          أدخل رمز API الخاص بك لتفعيل التكامل مع مصادر السكراب الخارجية.
        </div>

        <div className={styles['token-input-row']}>
          <Input
            type={tokenVisible ? 'text' : 'password'}
            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
            value={tokenValue}
            onChange={(e) => setTokenValue(e.target.value)}
            dir="ltr"
            variant="token"
          />
          <Button onClick={onToggleTokenVisibility}>عرض</Button>
          <Button className={styles.save} onClick={() => onSaveToken(tokenValue)}>
            حفظ
          </Button>
        </div>

        <div className={cn(styles['token-status-row'], savedToken ? styles.saved : styles.missing)}>
          {savedToken ? 'تم حفظ الرمز' : 'لم يتم ضبط الرمز بعد'}
        </div>
      </div>

      <div className={styles['chart-box']}>
        <div className={styles['chart-header']}>
          <div className={styles['chart-title']}>مصادر السكراب</div>
        </div>

        {[
          { name: 'LinkedIn Jobs', status: scraperRunning, jobs: 8 },
          { name: 'Bayt.com', status: scraperRunning, jobs: 5 },
          { name: 'Jadarat', status: false, jobs: 0 },
        ].map((src) => (
          <div className={styles['source-row']} key={src.name}>
            <div className={styles['source-info']}>
              <div className={styles['source-name']}>{src.name}</div>
              <div className={styles['source-jobs']}>{src.jobs} وظيفة مجموعة اليوم</div>
            </div>
            <Badge
              className={cn(styles['status-badge'], src.status ? styles.active : styles.suspended)}
            >
              {src.status ? 'نشط' : 'متوقف'}
            </Badge>
          </div>
        ))}
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
