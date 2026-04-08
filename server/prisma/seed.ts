import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = [
    { key: 'auto_registration_enabled', value: 'true', description: 'Allow new user registration' },
    { key: 'maintenance_mode', value: 'false', description: 'Block non-admin routes when enabled' },
    { key: 'verbose_logs', value: 'false', description: 'Enable verbose logging' },
    { key: 'email_sending_enabled', value: 'true', description: 'Enable email sending globally' },
    { key: 'max_emails_per_day', value: '50', description: 'Daily email limit per user' },
    { key: 'smtp_sender_email', value: '', description: 'SMTP sender address' },
    { key: 'scraper_enabled', value: 'true', description: 'Enable scrapers' },
    { key: 'scraper_interval_minutes', value: '120', description: 'Minutes between scraper runs' },
    {
      key: 'scraper_time_gap_seconds',
      value: '5',
      description: 'Seconds between individual source scrapes',
    },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
