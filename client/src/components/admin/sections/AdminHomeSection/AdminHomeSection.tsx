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
import styles from './AdminHomeSection.module.css';

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend);

interface AdminHomeSectionProps {
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

export default function AdminHomeSection({ logs }: AdminHomeSectionProps) {
  const users = useAnimatedCounter(1247);
  const jobs = useAnimatedCounter(20);
  const apply = useAnimatedCounter(184);
  const success = useAnimatedCounter(68, '%');
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        datasets: [
          {
            label: 'تسجيلات',
            data: [18, 25, 32, 28, 41, 37, 23],
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
            data: [42, 65, 58, 74, 89, 76, 54],
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
            data: [2, 1, 4, 2, 1, 3, 1],
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
  }, []);

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
          title="المستخدمون"
          trend={{ value: '↑ +٢٣ اليوم', direction: 'up' }}
        />

        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          trendClassName={styles['stat-change']}
          value={jobs}
          title="الوظائف"
          trend={{ value: '↑ +٥ جديدة', direction: 'up' }}
        />

        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          trendClassName={styles['stat-change']}
          value={apply}
          title="تقديمات اليوم"
          trend={{ value: '↑ +٤٧ هذا الأسبوع', direction: 'up' }}
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
              <div className={cn(styles['log-dot'], styles[log.type])} />
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
