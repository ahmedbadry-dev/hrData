import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { AppFile } from './settings.types';
import { emailConfig } from '@/config/env.config';

export class SettingsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getSettings(): Promise<Record<string, string>> {
    const settings = await this.prisma.systemSetting.findMany({
      where: { key: { not: 'app_logo' } },
    });

    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, string>
    );
  }

  async saveSettings(settings: Record<string, string>): Promise<Record<string, string>> {
    for (const [key, value] of Object.entries(settings)) {
      await this.prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    return settings;
  }

  async getLogo(): Promise<{
    logoPath: string | null;
    logoCid?: string | null;
    logoMimeType?: string | null;
    logoBuffer?: string | null;
  }> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'app_logo' },
    });

    const defaultLogoPath = '/uploads/logologo.png';
    const logoPath = setting?.value || defaultLogoPath;

    if (logoPath && logoPath.startsWith('/uploads/')) {
      const fullPath = path.join(process.cwd(), logoPath.replace(/^\//, ''));
      if (fs.existsSync(fullPath)) {
        const buffer = fs.readFileSync(fullPath);
        const mimeType = `image/${path.extname(logoPath).replace('.', '')}`;
        return {
          logoPath: `${emailConfig.serverUrl}${logoPath}`,
          logoCid: 'companylogo',
          logoMimeType: mimeType,
          logoBuffer: buffer.toString('base64'),
        };
      } else if (logoPath !== defaultLogoPath) {
        const fallbackPath = path.join(process.cwd(), defaultLogoPath.replace(/^\//, ''));
        if (fs.existsSync(fallbackPath)) {
          const buffer = fs.readFileSync(fallbackPath);
          const mimeType = `image/${path.extname(defaultLogoPath).replace('.', '')}`;
          return {
            logoPath: `${emailConfig.serverUrl}${defaultLogoPath}`,
            logoCid: 'companylogo',
            logoMimeType: mimeType,
            logoBuffer: buffer.toString('base64'),
          };
        }
      }
    }
    return { logoPath };
  }

  async uploadLogo(file: AppFile | undefined): Promise<{ logoPath: string }> {
    const existingLogo = await this.prisma.systemSetting.findUnique({
      where: { key: 'app_logo' },
    });

    const defaultLogoPath = '/uploads/logologo.png';
    const oldLogoPath = existingLogo?.value;

    if (oldLogoPath && oldLogoPath !== defaultLogoPath) {
      const oldPath = oldLogoPath.replace(/^\//, '');
      const fullPath = path.join(process.cwd(), oldPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    const logoPath = `/uploads/${file?.filename || ''}`;

    await this.prisma.systemSetting.upsert({
      where: { key: 'app_logo' },
      update: { value: logoPath },
      create: { key: 'app_logo', value: logoPath },
    });

    return { logoPath: `${emailConfig.serverUrl}${logoPath}` };
  }
}
