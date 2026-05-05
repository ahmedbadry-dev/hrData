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
        <title>HR Data | منصة التوظيف المباشر</title>
        <meta
          name="description"
          content="HR Data هي منصة ذكية تساعدك على اكتشاف وتتبع والتقديم على أفضل الوظائف في المملكة العربية السعودية والشرق الأوسط بشكل آلي واحترافي."
        />
        <meta
          name="keywords"
          content="وظائف، HR Data، توظيف، السعودية، تقديم آلي، بحث عن عمل، مسيرة مهنية"
        />
        <meta property="og:title" content="HR Data | منصة التوظيف المباشر" />
        <meta
          property="og:description"
          content="اكتشف وتتبع والتقديم على أفضل الوظائف بشكل آلي واحترافي مع منصة HR Data."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HR Data | منصة التوظيف المباشر" />
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
