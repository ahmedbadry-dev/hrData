import { Request, Response } from 'express';
import ResponseHelper from '@/shared/utils/api-response';
import { ProfileService } from './profile.service';
import { PROFILE_CONSTANTS } from './profile.constants';
import {
  UpdatePersonalProfileDto,
  UpdateProfileEducationSkillsDto,
  UpdateProfileExperienceDto,
} from './dto/profile.dto';

export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  getProfile = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.profileService.getProfile(req.user!.id);
    return ResponseHelper.ok(
      res,
      data,
      PROFILE_CONSTANTS.MESSAGES.PROFILE_FETCHED_SUCCESSFULLY,
      req.path
    );
  };

  updatePersonal = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.profileService.updatePersonal(
      req.user!.id,
      req.body as UpdatePersonalProfileDto['body']
    );
    return ResponseHelper.ok(
      res,
      data,
      PROFILE_CONSTANTS.MESSAGES.PERSONAL_PROFILE_UPDATED_SUCCESSFULLY,
      req.path
    );
  };

  updateExperience = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.profileService.updateExperience(
      req.user!.id,
      req.body as UpdateProfileExperienceDto['body']
    );
    return ResponseHelper.ok(
      res,
      data,
      PROFILE_CONSTANTS.MESSAGES.EXPERIENCE_UPDATED_SUCCESSFULLY,
      req.path
    );
  };

  updateEducationSkills = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.profileService.updateEducationSkills(
      req.user!.id,
      req.body as UpdateProfileEducationSkillsDto['body']
    );
    return ResponseHelper.ok(
      res,
      data,
      PROFILE_CONSTANTS.MESSAGES.EDUCATION_SKILLS_UPDATED_SUCCESSFULLY,
      req.path
    );
  };
}
