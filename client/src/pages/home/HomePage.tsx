import { HomeLayout } from '@/components/home/layout';
import {
  HomeCtaSection,
  HomeFeaturesSection,
  HomeFooterSection,
  HomeHeroSection,
  HomeHowSection,
  HomeQuoteSection,
} from '@/components/home/sections';

export default function HomePage() {
  return (
    <HomeLayout>
      <HomeHeroSection />
      <HomeHowSection />
      <HomeFeaturesSection />
      <HomeQuoteSection />
      <HomeCtaSection />
      <HomeFooterSection />
    </HomeLayout>
  );
}
