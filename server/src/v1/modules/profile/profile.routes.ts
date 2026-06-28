import { Router } from 'express';
import { authenticationMiddleware } from '../../../http/middlewares/auth.middleware';
import { validateBodyMiddleware } from '../../../http/middlewares/validation.middleware';
import {
  UpdatePersonalProfileDtoSchema,
  UpdateProfileEducationSkillsDtoSchema,
  UpdateProfileExperienceDtoSchema,
} from './dto/profile.dto';
import { ProfileController } from './profile.controller';

export const profileRoutes = (profileController: ProfileController): Router => {
  const router = Router();

  router.get('/me', authenticationMiddleware, profileController.getProfile);

  router.patch(
    '/me/personal',
    authenticationMiddleware,
    validateBodyMiddleware(UpdatePersonalProfileDtoSchema),
    profileController.updatePersonal
  );

  router.put(
    '/me/experience',
    authenticationMiddleware,
    validateBodyMiddleware(UpdateProfileExperienceDtoSchema),
    profileController.updateExperience
  );

  router.put(
    '/me/education-skills',
    authenticationMiddleware,
    validateBodyMiddleware(UpdateProfileEducationSkillsDtoSchema),
    profileController.updateEducationSkills
  );

  return router;
};
