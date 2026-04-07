import { homeSteps } from '../homeData';
import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

export default function HomeHowItWorksSection() {
  return (
    <section className={styles.section} id="how">
      <div className={styles['section-tag']}>كيف يعمل</div>
      <div className={styles['section-title']}>ثلاث خطوات وانتهينا</div>

      <div className={styles['steps-grid']}>
        {homeSteps.map((step) => (
          <div key={step.number} className={`${styles.step} ${styles.reveal}`}>
            <div className={styles['step-num']}>{step.number}</div>
            <div className={styles['step-accent']} />
            <div className={styles['step-title']}>{step.title}</div>
            <div className={styles['step-body']}>{step.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
