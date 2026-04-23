import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { PageHeader, StatCard } from '@/components/common';
import { Spinner } from '@/components/ui';
import { useTopAppliedJobs } from '@/modules/admin/analytics/api/hooks';
import styles from './AdminAnalyticsSection.module.css';
import type {
  OverviewStats,
  AdvancedOverviewStats,
  DailyDataPoint,
  ApplicationStatusDistribution,
  UserActivityDataPoint,
} from '@/modules/admin/analytics/api/types';

interface AdminAnalyticsSectionProps {
  overview?: OverviewStats;
  advanced?: AdvancedOverviewStats;
  applicationsPerDay?: DailyDataPoint[];
  statusDistribution?: ApplicationStatusDistribution;
  userActivity?: UserActivityDataPoint[];
  isOverviewLoading?: boolean;
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

export default function AdminAnalyticsSection({
  overview,
  advanced,
  applicationsPerDay,
  statusDistribution,
  userActivity,
  isOverviewLoading,
}: AdminAnalyticsSectionProps) {
  const {
    data: topJobsResponse,
    isLoading: isTopJobsLoading,
    isError: isTopJobsError,
  } = useTopAppliedJobs(10);
  const topJobs = topJobsResponse?.data;

  const total = useAnimatedCounter(overview?.totalApplicationsSent ?? 0);
  const auto = useAnimatedCounter(advanced?.autoSuccessRate ?? 0, '%');
  const active = useAnimatedCounter(overview?.activeUsers ?? 0);

  const topJobsRef = useRef<HTMLCanvasElement | null>(null);
  const usersActivityRef = useRef<HTMLCanvasElement | null>(null);
  const autoSuccessRef = useRef<HTMLCanvasElement | null>(null);
  const dailyApplyRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!topJobsRef.current && !usersActivityRef.current && !autoSuccessRef.current && !dailyApplyRef.current) {
      return;
    }

    const charts: Chart[] = [];

    if (topJobsRef.current && topJobs?.length) {
      charts.push(
        new Chart(topJobsRef.current, {
          type: 'bar',
          data: {
            labels: topJobs.map((j) => j.title),
            datasets: [
              {
                data: topJobs.map((j) => j.applicationCount),
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

    if (usersActivityRef.current && userActivity?.length) {
      const labels = userActivity.map((d) => {
        const date = new Date(d.date);
        const days = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
        return days[date.getDay()];
      });
      charts.push(
        new Chart(usersActivityRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'نشط',
                data: userActivity.map((d) => d.activeUsers),
                backgroundColor: '#0d0d0d',
                barThickness: 18,
              },
              {
                label: 'جلسات جديدة',
                data: userActivity.map((d) => d.newSessions),
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

    if (autoSuccessRef.current && statusDistribution) {
      charts.push(
        new Chart(autoSuccessRef.current, {
          type: 'doughnut',
          data: {
            labels: ['ناجح', 'فشل الإرسال', 'قيد الإرسال'],
            datasets: [
              {
                data: [
                  statusDistribution.success,
                  statusDistribution.failed,
                  statusDistribution.pending,
                ],
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

    if (dailyApplyRef.current && applicationsPerDay?.length) {
      charts.push(
        new Chart(dailyApplyRef.current, {
          type: 'line',
          data: {
            labels: applicationsPerDay.map((d) => d.date.split('-')[2]),
            datasets: [
              {
                data: applicationsPerDay.map((d) => d.count),
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
  }, [topJobs, userActivity, applicationsPerDay, statusDistribution, overview, advanced]);

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
          value={useAnimatedCounter(overview?.totalJobs ?? 0)}
          title="إجمالي الوظائف"
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
          value={
            isOverviewLoading ? <Spinner size="sm" className={styles['stat-spinner']} /> : active
          }
          title="مستخدمون نشطون"
        />
      </div>

      <div className={styles['charts-2col']}>
        <div className={styles['chart-box']}>
          <div className={styles['chart-header']}>
            <div className={styles['chart-title']}>أكثر الوظائف طلبًا</div>
          </div>
          <div className={styles['chart-wrap']}>
            {isTopJobsError ? (
              <div className={styles['chart-error']}>تعذّر تحميل بيانات الوظائف الآن</div>
            ) : isTopJobsLoading ? (
              <div className={styles['chart-loading']}>
                <Spinner size="md" />
              </div>
            ) : topJobs && topJobs.length > 0 ? (
              <canvas ref={topJobsRef} />
            ) : (
              <div className={styles['chart-empty']}>لا توجد بيانات متاحة للوظائف حالياً</div>
            )}
          </div>
        </div>

        <div className={styles['chart-box']}>
          <div className={styles['chart-header']}>
            <div className={styles['chart-title']}>نشاط المستخدمين</div>
          </div>
          <div className={styles['chart-wrap']}>
            {userActivity && userActivity.length > 0 ? (
              <canvas ref={usersActivityRef} />
            ) : (
              <div className={styles['chart-empty']}>لا يوجد نشاط مسجل للمستخدمين خلال هذه الفترة</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles['charts-2col']}>
        <div className={styles['chart-box']}>
          <div className={styles['chart-header']}>
            <div className={styles['chart-title']}>نسبة نجاح التقديم الآلي</div>
          </div>
          <div className={styles['chart-wrap-small']}>
            {statusDistribution && (statusDistribution.success > 0 || statusDistribution.failed > 0 || statusDistribution.pending > 0) ? (
              <canvas ref={autoSuccessRef} />
            ) : (
              <div className={styles['chart-empty']}>لم يتم رصد أي محاولات تقديم آلي بعد</div>
            )}
          </div>
        </div>

        <div className={styles['chart-box']}>
          <div className={styles['chart-header']}>
            <div className={styles['chart-title']}>التقديمات اليومية — ٣٠ يوم</div>
          </div>
          <div className={styles['chart-wrap-small']}>
            {applicationsPerDay && applicationsPerDay.length > 0 ? (
              <canvas ref={dailyApplyRef} />
            ) : (
              <div className={styles['chart-empty']}>لا توجد بيانات تقديمات يومية متاحة</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
