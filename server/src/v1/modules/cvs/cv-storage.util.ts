import path from 'node:path';

const CV_STORAGE_ROOT = path.resolve(process.cwd(), 'uploads', 'cvs');

const normalizeStoredPath = (storedPath: string): string => {
  return storedPath.replace(/\\/g, '/').replace(/^\/+/, '');
};

export const getCvStorageRoot = (): string => {
  return CV_STORAGE_ROOT;
};

export const toStoredCvPath = (fileName: string): string => {
  return `cvs/${fileName}`;
};

export const resolveStoredCvPath = (storedPath: string): string => {
  const normalized = normalizeStoredPath(storedPath).replace(/^cvs\//, '');
  const absolutePath = path.resolve(CV_STORAGE_ROOT, normalized);

  if (!absolutePath.startsWith(CV_STORAGE_ROOT)) {
    throw new Error('Invalid CV storage path');
  }

  return absolutePath;
};
