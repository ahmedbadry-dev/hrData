import { PrismaClient } from 'generated/prisma';
import prisma from '@/config/db.config';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import { toStoredCvPath } from './cv-storage.util';

export class CvsService {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async uploadCv(
    userId: string,
    file: {
      originalname: string;
      filename: string;
      size: number;
      mimetype: string;
    },
    isDefault?: boolean
  ) {
    if (!file.mimetype.includes('pdf')) {
      throw new BadRequestException('Only PDF files are allowed');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    const fileUrl = toStoredCvPath(file.filename);

    if (isDefault) {
      await this.prismaClient.cv.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const cv = await this.prismaClient.cv.create({
      data: {
        userId,
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        isDefault: isDefault ?? false,
      },
    });

    return cv;
  }

  async getUserCvs(userId: string) {
    return this.prismaClient.cv.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
        isDefault: true,
        createdAt: true,
      },
    });
  }

  async deleteCv(userId: string, cvId: string) {
    const cv = await this.prismaClient.cv.findFirst({
      where: { id: cvId, userId },
    });

    if (!cv) {
      throw new BadRequestException('CV not found');
    }

    await this.prismaClient.$transaction(async (tx) => {
      await tx.application.updateMany({
        where: { cvId },
        data: { cvId: null },
      });

      await tx.cv.delete({ where: { id: cvId } });
    });

    return { success: true };
  }

  async setDefaultCv(userId: string, cvId: string) {
    const cv = await this.prismaClient.cv.findFirst({
      where: { id: cvId, userId },
    });

    if (!cv) {
      throw new BadRequestException('CV not found');
    }

    await this.prismaClient.$transaction([
      this.prismaClient.cv.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      this.prismaClient.cv.update({
        where: { id: cvId },
        data: { isDefault: true },
      }),
      this.prismaClient.application.updateMany({
        where: { userId, cvId: null, status: 'SCHEDULED' },
        data: { cvId },
      }),
    ]);

    return { success: true };
  }
}

export const cvsService = new CvsService();
