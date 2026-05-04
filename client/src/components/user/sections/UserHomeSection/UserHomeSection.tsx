import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { PageHeader, StatCard } from '@/components/common';
import styles from './UserHomeSection.module.css';

interface UserHomeSectionProps {
  savedCount: number;
  applicationsCount?: number;
  repliesCount?: number;
  totalJobs?: number;
  weeklyData?: number[];
  isStatsLoading?: boolean;
  isWeeklyLoading?: boolean;
}

export default function UserHomeSection({
  savedCount,
  applicationsCount = 0,
  repliesCount = 0,
  totalJobs = 0,
  weeklyData,
  isStatsLoading = false,
  isWeeklyLoading = false,
}: UserHomeSectionProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [chartLoaded, setChartLoaded] = useState(false);

  const chartValues = useMemo(() => weeklyData ?? [0, 0, 0, 0, 0, 0, 0], [weeklyData]);
  const chartDataKey = useMemo(() => chartValues.join('-'), [chartValues]);

  useEffect(() => {
    if (isWeeklyLoading) {
      setChartLoaded(false);
      return;
    }

    if (!weeklyData || weeklyData.length === 0 || !weeklyData.some((value) => value > 0)) {
      setChartLoaded(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setChartLoaded(true);
    }, 200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isWeeklyLoading, weeklyData]);

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
            data: chartValues,
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
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        },
        animations: {
          y: {
            from: 0,
            duration: 1000,
            easing: 'easeOutQuart',
            delay: (context: { type: string; dataIndex: number }) =>
              context.type === 'data' ? context.dataIndex * 100 : 0,
          },
        },
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
  }, [chartDataKey, chartValues]);

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
          value={savedCount}
          isLoading={isStatsLoading}
          title="الوظائف المحفوظة"
        />
        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          value={applicationsCount}
          isLoading={isStatsLoading}
          title="إجمالي التقديمات"
        />
        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          value={`${repliesCount}%`}
          isLoading={isStatsLoading}
          title="نسبة نجاح التقديم الآلي"
        />
        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          value={totalJobs}
          isLoading={isStatsLoading}
          title="إجمالي الوظائف"
        />
      </div>

      <div className={`${styles['chart-container']} ${chartLoaded ? styles.loaded : ''}`.trim()}>
        <div className={styles['chart-header']}>
          <div className={styles['chart-title']}>نشاط الإرسال خلال الأسبوع</div>
        </div>
        <div className={styles['chart-wrap']}>
          <canvas key={chartDataKey} ref={chartRef} />
        </div>
      </div>
    </section>
  );
}
