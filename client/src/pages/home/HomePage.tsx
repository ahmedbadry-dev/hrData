import { useEffect, useRef } from 'react';
import HomeFooter from '@/components/home/layout/HomeFooter';
import HomeNavbar from '@/components/home/layout/HomeNavbar';
import HomeCtaSection from '@/components/home/sections/HomeCtaSection';
import HomeFeaturesSection from '@/components/home/sections/HomeFeaturesSection';
import HomeHeroSection from '@/components/home/sections/HomeHeroSection';
import HomeHowItWorksSection from '@/components/home/sections/HomeHowItWorksSection';
import HomeQuoteSection from '@/components/home/sections/HomeQuoteSection';
import styles from './HomePage.module.css';

export default function HomePage() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reveals = root.querySelectorAll<HTMLElement>(`.${styles.reveal}`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.in);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles['home-page']} ref={rootRef}>
      <HomeNavbar />
      <HomeHeroSection />
      <HomeHowItWorksSection />
      <HomeFeaturesSection />
      <HomeQuoteSection />
      <HomeCtaSection />
      <HomeFooter />
    </div>
  );
}
