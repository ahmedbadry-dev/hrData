import { useEffect, useRef, useState } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { PageHeader, StatCard } from '@/components/common';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { AdminLog } from '@/components/admin/sections/adminData';
import type { OverviewStats, DailyDataPoint } from '@/modules/admin/analytics/api/types';
import styles from './AdminHomeSection.module.css';

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend);

interface AdminHomeSectionProps {
  stats?: OverviewStats;
  loginsData?: DailyDataPoint[];
  applicationsData?: DailyDataPoint[];
  errorsData?: DailyDataPoint[];
  logs: AdminLog[];
}

function useAnimatedCounter(target: number, suffix = '') {
  const [value, setValue] = useState(`0${suffix}`);

  useEffect(() => {
    const start = performance.now();
    const duration = 1100;

    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      const current = Math.floor(target * ease);
      setValue(`${current}${suffix}`);
      if (p < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, suffix]);

  return value;
}

export default function AdminHomeSection({
  stats,
  loginsData,
  applicationsData,
  errorsData,
  logs,
}: AdminHomeSectionProps) {
  const users = useAnimatedCounter(stats?.totalUsers ?? 0);
  const jobs = useAnimatedCounter(stats?.totalJobs ?? 0);
  const apply = useAnimatedCounter(stats?.totalApplications ?? 0);
  const success = useAnimatedCounter(stats?.emailOpenedPercentage ?? 0, '%');
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    const logins = loginsData?.map((d) => d.count) ?? [];
    const applies = applicationsData?.map((d) => d.count) ?? [];
    const errs = errorsData?.map((d) => d.count) ?? [];

    const chart = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'تسجيلات',
            data: logins.length ? logins : [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#1a4a8a',
            backgroundColor: 'rgba(26,74,138,.08)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#1a4a8a',
          },
          {
            label: 'تقديمات',
            data: applies.length ? applies : [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#1a6b4a',
            backgroundColor: 'rgba(26,107,74,.08)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#1a6b4a',
          },
          {
            label: 'أخطاء',
            data: errs.length ? errs : [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#c0392b',
            backgroundColor: 'rgba(192,57,43,.06)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#c0392b',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: { family: 'Cairo', size: 11 },
              boxWidth: 12,
              padding: 14,
            },
          },
          tooltip: {
            titleFont: { family: 'Cairo' },
            bodyFont: { family: 'Cairo' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(13,13,13,.05)' },
            ticks: { font: { family: 'Cairo' } },
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Cairo', weight: 700 } },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [loginsData, applicationsData, errorsData]);

  return (
    <section>
      <PageHeader
        eyebrow="لوحة الإدارة"
        title="الرئيسية"
        eyebrowClassName={styles['section-eyebrow']}
        titleClassName={styles['section-headline']}
      />

      <div className={styles['stats-grid']}>
        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          trendClassName={styles['stat-change']}
          value={users}
          title="إجمالي المستخدمين"
          trend={{
            value: stats?.newUsersToday ? `+${stats.newUsersToday} مستخدم جديد اليوم` : '',
            direction: 'up',
          }}
        />

        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          trendClassName={styles['stat-change']}
          value={jobs}
          title="إجمالي الوظائف"
          trend={{
            value: stats?.newJobsToday ? `+${stats.newJobsToday} وظيفة أضيفت اليوم` : '',
            direction: 'up',
          }}
        />

        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          trendClassName={styles['stat-change']}
          value={apply}
          title="إجمالي التقديمات"
          trend={{
            value: stats?.applicationsThisWeek
              ? `+${stats.applicationsThisWeek} تقديم هذا الأسبوع`
              : '',
            direction: 'up',
          }}
        />

        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          trendClassName={styles['stat-change']}
          value={success}
          title="نسبة النجاح"
          trend={{ value: '↑ ممتاز', direction: 'up' }}
        />
      </div>

      <div className={styles['chart-box']}>
        <div className={styles['chart-header']}>
          <div className={styles['chart-title']}>نشاط المنصة — آخر ٧ أيام</div>
          <Badge variant="success" className={cn(styles['chart-badge'], styles.live)}>
            مباشر
          </Badge>
        </div>
        <div className={styles['chart-wrap']}>
          <canvas ref={chartRef} />
        </div>
      </div>

      <div className={styles['chart-box']}>
        <div className={styles['chart-header']}>
          <div className={styles['chart-title']}>آخر العمليات</div>
          <Badge variant="neutral" className={cn(styles['chart-badge'], styles.muted)}>
            {logs.length} عملية
          </Badge>
        </div>

        <div className={styles['log-list']}>
          {logs.map((log, i) => (
            <div
              className={styles['log-item']}
              style={{ animationDelay: `${i * 0.06}s` }}
              key={log.text}
            >
              <span className={styles['log-icon']}>
                {log.action === 'LOGIN' ? '🔑' : 
                 log.action === 'VERIFY_EMAIL' ? '✅' : 
                 log.action === 'RESET_PASSWORD' ? '🔄' : '🔒'}
              </span>
              <span className={styles['log-text']}>{log.text}</span>
              <span
                className={styles['log-type-badge']}
                style={{
                  background: `${log.color}18`,
                  color: log.color,
                  border: `1px solid ${log.color}40`,
                }}
              >
                {log.typeLabel}
              </span>
              <span className={styles['log-time']}>{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
