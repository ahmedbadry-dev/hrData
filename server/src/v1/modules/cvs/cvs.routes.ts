import { Router } from 'express';
import { authenticationMiddleware } from '@/http/middlewares/auth.middleware';
import { CvsController } from './cvs.controller';
import { validateBodyMiddleware } from '@/http/middlewares/validation.middleware';
import { UploadCvDtoSchema } from './dto/upload-cv.dto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/cvs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

const cvsController = new CvsController();
const router = Router();

router.post('/', authenticationMiddleware, upload.single('file'), cvsController.uploadCv);

router.get('/', authenticationMiddleware, cvsController.getCvs);

router.delete('/:id', authenticationMiddleware, cvsController.deleteCv);

router.patch('/:id/default', authenticationMiddleware, cvsController.setDefaultCv);

export const cvsRoutes = router;
