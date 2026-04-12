import { Router } from 'express';
import { authenticationMiddleware } from '@/http/middlewares/auth.middleware';
import { CvsController } from './cvs.controller';
import { validateParamsMiddleware } from '@/http/middlewares/validation.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getCvStorageRoot } from './cv-storage.util';
import { CvIdParamDtoSchema } from './dto/cv-id-param.dto';
import { downloadCvFile } from './cvs.download.controller';
import { CvsService } from './cvs.service';

const sanitizeFilename = (filename: string): string => {
  const baseName = path.basename(filename);
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const uploadDir = getCvStorageRoot();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedFileName = sanitizeFilename(file.originalname);
    cb(null, uniqueSuffix + '-' + sanitizedFileName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

const cvsService = new CvsService();
const cvsController = new CvsController(cvsService);
const router = Router();

router.post('/', authenticationMiddleware, upload.single('file'), cvsController.uploadCv);

router.get('/', authenticationMiddleware, cvsController.getCvs);

router.delete(
  '/:id',
  authenticationMiddleware,
  validateParamsMiddleware(CvIdParamDtoSchema),
  cvsController.deleteCv
);

router.patch(
  '/:id/default',
  authenticationMiddleware,
  validateParamsMiddleware(CvIdParamDtoSchema),
  cvsController.setDefaultCv
);

router.get(
  '/:id/file',
  authenticationMiddleware,
  validateParamsMiddleware(CvIdParamDtoSchema),
  downloadCvFile
);

export const cvsRoutes = router;
