import { PrismaClient } from '../generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();
const HR_EMAIL = process.env.TEST_HR_EMAIL || 'test@kafoo.test';

const count = parseInt(process.argv[2] || '1', 10);

async function main() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const jobs = Array.from({ length: count }, (_, i) => ({
    title: `${faker.person.jobTitle()} ${i}`,
    companyName: `${faker.company.name()} ${i}`,
    location: faker.helpers.arrayElement([
      'RIYADH',
      'JEDDAH',
      'DAMMAM',
      'KHOBAR',
      'MECCA',
      'MEDINA',
      'TABUK',
    ]) as 'RIYADH' | 'JEDDAH' | 'DAMMAM' | 'KHOBAR' | 'MECCA' | 'MEDINA' | 'TABUK',
    category: faker.helpers.arrayElement([
      'Engineering',
      'IT',
      'Finance',
      'Marketing',
      'Education',
      'HR',
    ]),
    description: faker.lorem.sentence(),
    hrEmail: HR_EMAIL,
    source: faker.internet.url(),
    sourceUrl: faker.internet.url(),
    language: 'ar',
    postedAt: faker.date.between({ from: thirtyDaysAgo, to: now }),
    expiresAt: faker.date.between({ from: now, to: thirtyDaysFromNow }),
    isExpired: false,
  }));

  await prisma.job.createMany({ data: jobs, skipDuplicates: true });
  console.log(`Seeded ${count} jobs`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
