import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { PageHeader, StatCard } from '@/components/common';
import styles from './UserHomeSection.module.css';

interface UserHomeSectionProps {
  savedCount: number;
  applicationsCount?: number;
  repliesCount?: number;
  totalJobs?: number;
  weeklyData?: number[];
}

function useAnimatedCounter(target: number, suffix = '') {
  const [value, setValue] = useState(`0${suffix}`);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1500;
    let frame = 0;

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(target * easeOutQuart);
      setValue(`${current}${suffix}`);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, suffix]);

  return value;
}

export default function UserHomeSection({
  savedCount,
  applicationsCount = 0,
  repliesCount = 0,
  totalJobs = 0,
  weeklyData,
}: UserHomeSectionProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const saved = useAnimatedCounter(savedCount);
  const replies = useAnimatedCounter(repliesCount);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstanceRef.current?.destroy();

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        datasets: [
          {
            label: 'الإيميلات المرسلة',
            data: weeklyData || [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#0d0d0d',
            borderColor: '#0d0d0d',
            borderWidth: 1,
            barThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(13,13,13,0.05)' },
            ticks: { font: { family: 'Cairo' } },
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Cairo', weight: 700 } },
          },
        },
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, [weeklyData]);

  return (
    <section>
      <PageHeader
        eyebrow="لوحة المستخدم"
        title="الرئيسية"
        eyebrowClassName={styles['section-eyebrow']}
        titleClassName={styles['section-headline']}
      />

      <div className={styles['welcome-state']}>
        <div className={styles['big-number']}>١٠٠+</div>
        <p>وظيفة بانتظارك — اختر «اكتشف الوظائف» للبدء</p>
      </div>

      <div className={styles['stats-grid']}>
        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          value={saved}
          title="الوظائف المحفوظة"
        />
        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          value={applicationsCount}
          title="إجمالي التقديمات"
        />
        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          value={replies}
          title="الردود"
        />
        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          value={totalJobs}
          title="إجمالي الوظائف"
        />
      </div>

      <div className={styles['chart-container']}>
        <div className={styles['chart-header']}>
          <div className={styles['chart-title']}>نشاط الإرسال خلال الأسبوع</div>
        </div>
        <div className={styles['chart-wrap']}>
          <canvas ref={chartRef} />
        </div>
      </div>
    </section>
  );
}
