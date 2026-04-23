import { Helmet } from 'react-helmet-async';
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
      <Helmet>
        <title>كفو | رفيقك الذكي للبحث عن وظائف الأحلام</title>
        <meta
          name="description"
          content="كفو هو منصة ذكية تساعدك على اكتشاف وتتبع والتقديم على أفضل الوظائف في المملكة العربية السعودية والشرق الأوسط بشكل آلي واحترافي."
        />
        <meta
          name="keywords"
          content="وظائف، كفو، توظيف، السعودية، تقديم آلي، بحث عن عمل، مسيرة مهنية"
        />
        <meta property="og:title" content="كفو | رفيقك الذكي للبحث عن وظائف الأحلام" />
        <meta
          property="og:description"
          content="اكتشف وتتبع والتقديم على أفضل الوظائف بشكل آلي واحترافي مع منصة كفو."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="كفو | رفيقك الذكي للبحث عن وظائف الأحلام" />
        <meta
          name="twitter:description"
          content="منصة ذكية للتقديم الآلي على الوظائف وتتبع مسارك المهني."
        />
      </Helmet>
      <HomeHeroSection />
      <HomeHowSection />
      <HomeFeaturesSection />
      <HomeQuoteSection />
      <HomeCtaSection />
      <HomeFooterSection />
    </HomeLayout>
  );
}
