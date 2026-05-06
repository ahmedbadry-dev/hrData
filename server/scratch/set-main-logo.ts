import { PrismaClient } from '@prisma/client';

async function setMainLogo() {
  const prisma = new PrismaClient();
  const logoPath = '/uploads/logo-1778067994825-456904884.png';
  
  try {
    await prisma.systemSetting.upsert({
      where: { key: 'app_logo' },
      update: { value: logoPath },
      create: { key: 'app_logo', value: logoPath },
    });
    console.log(`✅ Successfully set main logo to: ${logoPath}`);
  } catch (error) {
    console.error('❌ Failed to set main logo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setMainLogo();
