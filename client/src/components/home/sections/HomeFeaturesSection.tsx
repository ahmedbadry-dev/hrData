import styles from '@/pages/home/HomePage.module.css';
import {
  homeFeatures,
  type HomeFeature,
  type HomeFeatureIcon,
} from '@/components/home/sections/homeData';

function FeatureIcon({ icon }: { icon: HomeFeatureIcon }) {
  if (icon === 'mail') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 6l10 7 10-7" />
      </svg>
    );
  }

  if (icon === 'star') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  if (icon === 'search') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 9h12M6 15h12M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
      <path d="M12 2v20" strokeLinecap="round" />
    </svg>
  );
}

function FeatureCard({ feature }: { feature: HomeFeature }) {
  return (
    <div className={`${styles['feature-block']} ${styles.reveal}`}>
      <div className={styles['feature-icon']}>
        <FeatureIcon icon={feature.icon} />
      </div>
      <div className={styles['feature-title']}>{feature.title}</div>
      <div className={styles['feature-body']}>{feature.body}</div>
    </div>
  );
}

export default function HomeFeaturesSection() {
  return (
    <section className={`${styles.section} ${styles['features-section']}`} id="features">
      <div className={`${styles['section-tag']} ${styles['features-tag']}`}>المميزات</div>
      <div className={styles['section-title']}>لماذا كُفُـؤ؟</div>

      <div className={styles['features-layout']}>
        {homeFeatures.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  );
}
