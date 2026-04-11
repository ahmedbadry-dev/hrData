import prisma from '@/config/db.config';
import { BadRequestException } from '@/shared/errors/BadRequestException';

export class CvsService {
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

    const fileUrl = `/uploads/cvs/${file.filename}`;

    if (isDefault) {
      await prisma.cv.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const cv = await prisma.cv.create({
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
    return prisma.cv.findMany({
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
    const cv = await prisma.cv.findFirst({
      where: { id: cvId, userId },
    });

    if (!cv) {
      throw new BadRequestException('CV not found');
    }

    await prisma.cv.delete({ where: { id: cvId } });

    return { success: true };
  }

  async setDefaultCv(userId: string, cvId: string) {
    const cv = await prisma.cv.findFirst({
      where: { id: cvId, userId },
    });

    if (!cv) {
      throw new BadRequestException('CV not found');
    }

    await prisma.$transaction([
      prisma.cv.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.cv.update({
        where: { id: cvId },
        data: { isDefault: true },
      }),
    ]);

    return { success: true };
  }
}

export const cvsService = new CvsService();
