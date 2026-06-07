import { Helmet } from 'react-helmet-async';
import { HomeLayout } from '@/components/home/layout';
import {
  HomeCtaSection,
  HomeFeaturesSection,
  HomeFooterSection,
  HomeGoogleDataSection,
  HomeHeroSection,
  HomeHowSection,
  HomeQuoteSection,
} from '@/components/home/sections';

export default function HomePage() {
  return (
    <HomeLayout>
      <Helmet>
        <title>HR Data | Job Search &amp; Auto-Apply Platform</title>
        <meta
          name="description"
          content="HR Data is an Arabic-language job search and auto-apply platform for Saudi Arabia. Discover job listings, save opportunities, and send applications directly from your Gmail account using send-only access."
        />
        <meta
          name="keywords"
          content="وظائف، HR Data، توظيف، السعودية، تقديم آلي، بحث عن عمل، مسيرة مهنية"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://hrdatasa.com/" />
        <meta property="og:title" content="HR Data | منصة التوظيف المباشر" />
        <meta
          property="og:description"
          content="اكتشف وتتبع والتقديم على أفضل الوظائف بشكل آلي واحترافي مع منصة HR Data."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hrdatasa.com/" />
        <meta property="og:site_name" content="HR Data" />
        <meta property="og:locale" content="ar_SA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HR Data | منصة التوظيف المباشر" />
        <meta
          name="twitter:description"
          content="منصة ذكية للتقديم الآلي على الوظائف وتتبع مسارك المهني."
        />
      </Helmet>
      <HomeHeroSection />
      <HomeGoogleDataSection />
      <HomeHowSection />
      <HomeFeaturesSection />
      <HomeQuoteSection />
      <HomeCtaSection />
      <HomeFooterSection />
    </HomeLayout>
  );
}
