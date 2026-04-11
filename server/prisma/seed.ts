import { PrismaClient } from '../generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      passwordHash: faker.string.alphanumeric(60),
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: faker.internet.email({ firstName: 'admin' }),
      phone: faker.phone.number(),
      passwordHash: faker.string.alphanumeric(60),
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  await prisma.session.create({
    data: {
      id: faker.string.uuid(),
      userId: user.id,
      tokenHash: faker.string.alphanumeric(64),
      expiresAt: faker.date.future(),
      deviceName: 'Chrome on Windows',
      ipAddress: faker.internet.ip(),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  await prisma.gmailToken.create({
    data: {
      userId: user.id,
      accessToken: faker.string.alphanumeric(100),
      refreshToken: faker.string.alphanumeric(100),
      tokenExpiry: faker.date.future(),
      email: user.email,
    },
  });

  const locations = ['RIYADH', 'JEDDAH', 'DAMMAM', 'KHOBAR', 'MECCA', 'MEDINA', 'TABUK'] as const;
  const categories = [
    'Engineering',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'IT',
    'Healthcare',
    'Education',
  ];
  const sources = ['linkedin', 'indeed', 'glassdoor', 'company_website', 'bayt', 'forasna'];

  const jobs = [];
  for (let i = 0; i < 10; i++) {
    const job = await prisma.job.create({
      data: {
        title: faker.person.jobTitle(),
        companyName: faker.company.name(),
        location: faker.helpers.arrayElement(locations),
        category: faker.helpers.arrayElement(categories),
        description: faker.lorem.paragraphs(3),
        hrEmail: faker.internet.email({ firstName: 'hr', lastName: 'recruiter' }),
        source: faker.helpers.arrayElement(sources),
        sourceUrl: faker.internet.url(),
        language: faker.helpers.arrayElement(['ar', 'en']),
        postedAt: faker.date.recent({ days: 30 }),
        expiresAt: faker.date.future({ years: 1 }),
        isExpired: false,
      },
    });
    jobs.push(job);
  }

  const savedJob = await prisma.savedJob.create({
    data: {
      userId: user.id,
      jobId: jobs[0].id,
    },
  });

  await prisma.cv.create({
    data: {
      userId: user.id,
      fileName: faker.system.fileName(),
      fileUrl: faker.internet.url(),
      fileSize: faker.number.int({ min: 50000, max: 500000 }),
      isDefault: true,
    },
  });

  await prisma.emailTemplate.create({
    data: {
      userId: user.id,
      name: 'Default Application Template',
      subject: 'Application for {{jobTitle}} position at {{companyName}}',
      body: faker.lorem.paragraphs(4),
      isDefault: true,
    },
  });

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      jobId: jobs[1].id,
      status: 'SENT',
      scheduledAt: faker.date.past(),
      sentAt: faker.date.past(),
      trackingToken: faker.string.alphanumeric(32),
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Application Sent',
      body: `Your application for ${jobs[1].title} has been sent successfully.`,
      type: 'SUCCESS',
      target: 'USER',
      isRead: false,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'JOB_APPLICATION_SENT',
      entityType: 'Application',
      entityId: application.id,
      metadata: { jobId: jobs[1].id, companyName: jobs[1].companyName },
      ipAddress: faker.internet.ip(),
    },
  });

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
  console.log(
    `Created: 2 users, 10 jobs, 1 saved job, 1 CV, 1 email template, 1 application, 1 notification, 1 activity log, ${settings.length} settings`
  );
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    // @ts-expect-error
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
