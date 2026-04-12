import fs from 'node:fs/promises';
import path from 'node:path';
import { Request, Response } from 'express';

import prisma from '@/config/db.config';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { ForbiddenException } from '@/shared/errors/ForbiddenException';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import { resolveStoredCvPath } from './cv-storage.util';

export const downloadCvFile = async (req: Request, res: Response): Promise<void> => {
  const cvId = req.params.id as string;

  const cv = await prisma.cv.findUnique({
    where: { id: cvId },
    select: { id: true, userId: true, fileName: true, fileUrl: true },
  });

  if (!cv) {
    throw new NotFoundException('CV not found');
  }

  if (!req.user || req.user.id !== cv.userId) {
    throw new ForbiddenException('You are not allowed to access this CV');
  }

  let absolutePath: string;
  try {
    absolutePath = resolveStoredCvPath(cv.fileUrl);
  } catch {
    throw new BadRequestException('Invalid CV path');
  }

  try {
    await fs.access(absolutePath);
  } catch {
    throw new NotFoundException('CV file not found on server');
  }

  res.download(absolutePath, path.basename(cv.fileName));
};
