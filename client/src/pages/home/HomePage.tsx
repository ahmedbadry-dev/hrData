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
        <title>HR Data - Job Search & Auto-Apply Platform</title>
        <meta
          name="description"
          content="HR Data is an Arabic-language job search and application automation platform for job seekers in Saudi Arabia. Users can discover job listings, save opportunities, upload a CV, and send job application emails directly from their connected Gmail account using Gmail send-only access."
        />
        <meta
          name="keywords"
          content="HR Data, HrDatasa, Saudi jobs, job search Saudi Arabia, auto apply jobs, Gmail send-only access, وظائف السعودية, منصة توظيف, تقديم آلي, البحث عن عمل"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://hrdatasa.com/" />
        <meta property="og:title" content="HR Data - Job Search & Auto-Apply Platform" />
        <meta
          property="og:description"
          content="Discover Saudi job listings, save opportunities, upload your CV, and send job application emails using Gmail send-only access."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hrdatasa.com/" />
        <meta property="og:site_name" content="HR Data" />
        <meta property="og:locale" content="ar_SA" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="HR Data - Job Search & Auto-Apply Platform" />
        <meta
          name="twitter:description"
          content="An Arabic-language job search and application automation platform for job seekers in Saudi Arabia."
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
