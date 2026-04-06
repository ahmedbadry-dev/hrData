import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import styles from './UserHomeSection.module.css';

interface UserHomeSectionProps {
  savedCount: number;
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

export default function UserHomeSection({ savedCount }: UserHomeSectionProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const totalEmails = useAnimatedCounter(124);
  const openRate = useAnimatedCounter(68, '%');
  const saved = useAnimatedCounter(savedCount);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
        datasets: [
          {
            label: 'الإيميلات المرسلة',
            data: [12, 19, 15, 25, 22],
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

    return () => chart.destroy();
  }, []);

  return (
    <section>
      <div className={styles['section-eyebrow']}>لوحة المستخدم</div>
      <div className={styles['section-headline']}>الرئيسية</div>

      <div className={styles['welcome-state']}>
        <div className={styles['big-number']}>٢٠</div>
        <p>وظيفة بانتظارك — اختر «اكتشف الوظائف» للبدء</p>
      </div>

      <div className={styles['stats-grid']}>
        <div className={styles['stat-card']}>
          <div className={styles['stat-val']}>{totalEmails}</div>
          <div className={styles['stat-tit']}>إجمالي Email المرسل</div>
        </div>
        <div className={styles['stat-card']}>
          <div className={styles['stat-val']}>{openRate}</div>
          <div className={styles['stat-tit']}>معدل الفتح</div>
        </div>
        <div className={styles['stat-card']}>
          <div className={styles['stat-val']}>{saved}</div>
          <div className={styles['stat-tit']}>الوظائف المحفوظة</div>
        </div>
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
