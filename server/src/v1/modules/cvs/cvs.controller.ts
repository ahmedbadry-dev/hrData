import { Request, Response } from 'express';
import { CvsService } from './cvs.service';
import ResponseHelper from '@/shared/utils/api-response';
import { HTTP_STATUS } from '@/shared/constants/http-status.constants';
import { BadRequestException } from '@/shared/errors/BadRequestException';

export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

  uploadCv = async (req: Request, res: Response): Promise<Response> => {
    const file = req.file;
    const isDefault = req.body.isDefault === 'true';

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const cv = await this.cvsService.uploadCv(req.user!.id, file, isDefault);

    return ResponseHelper.created(res, cv, 'CV uploaded successfully', req.path);
  };

  getCvs = async (req: Request, res: Response): Promise<Response> => {
    const cvs = await this.cvsService.getUserCvs(req.user!.id);
    return ResponseHelper.success(res, cvs, 'CVs retrieved successfully', HTTP_STATUS.OK, req.path);
  };

  deleteCv = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.cvsService.deleteCv(req.user!.id, id as string);
    return ResponseHelper.success(
      res,
      { success: true },
      'CV deleted successfully',
      HTTP_STATUS.OK,
      req.path
    );
  };

  setDefaultCv = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.cvsService.setDefaultCv(req.user!.id, id as string);
    return ResponseHelper.success(
      res,
      { success: true },
      'Default CV set successfully',
      HTTP_STATUS.OK,
      req.path
    );
  };
}
