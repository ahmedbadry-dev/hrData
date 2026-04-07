import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { PageHeader, StatCard } from '@/components/common';
import styles from './AdminAnalyticsSection.module.css';

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

export default function AdminAnalyticsSection() {
  const total = useAnimatedCounter(2847);
  const openRate = useAnimatedCounter(68, '%');
  const auto = useAnimatedCounter(74, '%');
  const active = useAnimatedCounter(1084);

  const topJobsRef = useRef<HTMLCanvasElement | null>(null);
  const usersActivityRef = useRef<HTMLCanvasElement | null>(null);
  const autoSuccessRef = useRef<HTMLCanvasElement | null>(null);
  const dailyApplyRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const charts: Chart[] = [];

    if (topJobsRef.current) {
      charts.push(
        new Chart(topJobsRef.current, {
          type: 'bar',
          data: {
            labels: ['أخصائي مبيعات', 'مطور برمجيات', 'محاسب عام', 'مدير مشروع', 'مصمم جرافيك'],
            datasets: [
              {
                data: [124, 98, 87, 76, 65],
                backgroundColor: ['#0d0d0d', '#c0392b', '#1a6b4a', '#b8860b', '#1a4a8a'],
                borderWidth: 0,
                barThickness: 26,
              },
            ],
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { titleFont: { family: 'Cairo' }, bodyFont: { family: 'Cairo' } },
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: { color: 'rgba(13,13,13,.05)' },
                ticks: { font: { family: 'Cairo' } },
              },
              y: {
                grid: { display: false },
                ticks: { font: { family: 'Cairo', weight: 700 }, color: '#0d0d0d' },
              },
            },
          },
        })
      );
    }

    if (usersActivityRef.current) {
      charts.push(
        new Chart(usersActivityRef.current, {
          type: 'bar',
          data: {
            labels: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس'],
            datasets: [
              {
                label: 'نشط',
                data: [210, 285, 260, 310, 275],
                backgroundColor: '#0d0d0d',
                barThickness: 18,
              },
              {
                label: 'جلسات جديدة',
                data: [45, 62, 58, 71, 66],
                backgroundColor: 'rgba(13,13,13,.25)',
                barThickness: 18,
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
                labels: { font: { family: 'Cairo', size: 10 }, boxWidth: 10, padding: 10 },
              },
              tooltip: { titleFont: { family: 'Cairo' }, bodyFont: { family: 'Cairo' } },
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
        })
      );
    }

    if (autoSuccessRef.current) {
      charts.push(
        new Chart(autoSuccessRef.current, {
          type: 'doughnut',
          data: {
            labels: ['ناجح', 'فشل', 'قيد الإرسال'],
            datasets: [
              {
                data: [74, 12, 14],
                backgroundColor: ['#1a6b4a', '#c0392b', '#b8860b'],
                borderWidth: 3,
                borderColor: '#f5f0e8',
                hoverOffset: 6,
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
                labels: { font: { family: 'Cairo', size: 11 }, boxWidth: 12, padding: 12 },
              },
              tooltip: {
                titleFont: { family: 'Cairo' },
                bodyFont: { family: 'Cairo' },
                callbacks: {
                  label: (context) => ` ${context.label}: ${context.parsed}%`,
                },
              },
            },
            cutout: '65%',
          },
        })
      );
    }

    if (dailyApplyRef.current) {
      const data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 120) + 40);
      charts.push(
        new Chart(dailyApplyRef.current, {
          type: 'line',
          data: {
            labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
            datasets: [
              {
                data,
                borderColor: '#c0392b',
                backgroundColor: 'rgba(192,57,43,.06)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { titleFont: { family: 'Cairo' }, bodyFont: { family: 'Cairo' } },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(13,13,13,.05)' },
                ticks: { font: { family: 'Cairo' } },
              },
              x: {
                grid: { display: false },
                ticks: { font: { family: 'Cairo' }, maxTicksLimit: 10 },
              },
            },
          },
        })
      );
    }

    return () => {
      charts.forEach((chart) => chart.destroy());
    };
  }, []);

  return (
    <section>
      <PageHeader
        eyebrow="التحليلات"
        title="التحليلات المتقدمة"
        eyebrowClassName={styles['section-eyebrow']}
        titleClassName={styles['section-headline']}
      />

      <div className={styles['stats-grid']}>
        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          value={total}
          title="إجمالي التقديمات"
        />
        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          value={openRate}
          title="معدل الفتح"
        />
        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          value={auto}
          title="نجاح الآلي"
        />
        <StatCard
          className={styles['stat-card']}
          valueClassName={styles['stat-val']}
          titleClassName={styles['stat-tit']}
          value={active}
          title="مستخدمون نشطون"
        />
      </div>

      <div className={styles['charts-2col']}>
        <div className={styles['chart-box']}>
          <div className={styles['chart-header']}>
            <div className={styles['chart-title']}>أكثر الوظائف طلبًا</div>
          </div>
          <div className={styles['chart-wrap']}>
            <canvas ref={topJobsRef} />
          </div>
        </div>

        <div className={styles['chart-box']}>
          <div className={styles['chart-header']}>
            <div className={styles['chart-title']}>نشاط المستخدمين</div>
          </div>
          <div className={styles['chart-wrap']}>
            <canvas ref={usersActivityRef} />
          </div>
        </div>
      </div>

      <div className={styles['charts-2col']}>
        <div className={styles['chart-box']}>
          <div className={styles['chart-header']}>
            <div className={styles['chart-title']}>نسبة نجاح التقديم الآلي</div>
          </div>
          <div className={styles['chart-wrap-small']}>
            <canvas ref={autoSuccessRef} />
          </div>
        </div>

        <div className={styles['chart-box']}>
          <div className={styles['chart-header']}>
            <div className={styles['chart-title']}>التقديمات اليومية — ٣٠ يوم</div>
          </div>
          <div className={styles['chart-wrap-small']}>
            <canvas ref={dailyApplyRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
