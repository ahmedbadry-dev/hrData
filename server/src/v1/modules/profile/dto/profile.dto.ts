import { JobQualification, JobSpecialization, LanguageLevel } from '@prisma/client';
import { z } from 'zod';
import { PROFILE_CONSTANTS } from '../profile.constants';

const currentYear = new Date().getFullYear();
const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
const saudiLocalPhoneRegex = /^05\d{8}$/;

const blankToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  return value;
};

const normalizeSaudiLocalPhone = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return undefined;
  }

  if (digits.startsWith('96605') && digits.length === 13) {
    return digits.slice(3);
  }

  if (digits.startsWith('9665') && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith('5') && digits.length === 9) {
    return `0${digits}`;
  }

  return digits;
};

const nullableTrimmedString = (maxLength: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(maxLength).optional());

const enumOrEmpty = <T extends Record<string, string>>(enumValue: T) =>
  z.preprocess(blankToUndefined, z.nativeEnum(enumValue).optional());

export const UpdatePersonalProfileDtoSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .trim()
      .min(1, 'First name is required')
      .max(PROFILE_CONSTANTS.LIMITS.NAME_MAX_LENGTH),
    lastName: z
      .string()
      .trim()
      .min(1, 'Last name is required')
      .max(PROFILE_CONSTANTS.LIMITS.NAME_MAX_LENGTH),
    phone: z.preprocess(
      normalizeSaudiLocalPhone,
      z
        .string()
        .regex(saudiLocalPhoneRegex, PROFILE_CONSTANTS.MESSAGES.INVALID_SAUDI_PHONE)
        .optional()
    ),
    summary: nullableTrimmedString(PROFILE_CONSTANTS.LIMITS.SUMMARY_MAX_LENGTH),
  }),
});

const ExperienceEntrySchema = z
  .object({
    jobTitle: z
      .string()
      .trim()
      .min(1, 'Job title is required')
      .max(PROFILE_CONSTANTS.LIMITS.NAME_MAX_LENGTH),
    company: z
      .string()
      .trim()
      .min(1, 'Company is required')
      .max(PROFILE_CONSTANTS.LIMITS.NAME_MAX_LENGTH),
    startDate: z.string().regex(monthRegex, PROFILE_CONSTANTS.MESSAGES.INVALID_MONTH),
    endDate: z.preprocess(
      blankToUndefined,
      z.string().regex(monthRegex, PROFILE_CONSTANTS.MESSAGES.INVALID_MONTH).optional()
    ),
    description: nullableTrimmedString(PROFILE_CONSTANTS.LIMITS.EXPERIENCE_TEXT_MAX_LENGTH),
  })
  .superRefine((entry, ctx) => {
    if (!entry.endDate) {
      return;
    }

    if (entry.endDate < entry.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: PROFILE_CONSTANTS.MESSAGES.INVALID_EXPERIENCE_DATE_RANGE,
      });
    }
  });

export const UpdateProfileExperienceDtoSchema = z.object({
  body: z.object({
    experiences: z.array(ExperienceEntrySchema).max(PROFILE_CONSTANTS.LIMITS.EXPERIENCE_MAX_COUNT),
  }),
});

const SkillSchema = z
  .string()
  .trim()
  .min(1, 'Skill is required')
  .max(PROFILE_CONSTANTS.LIMITS.SKILL_NAME_MAX_LENGTH);

const LanguageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Language name is required')
    .max(PROFILE_CONSTANTS.LIMITS.LANGUAGE_NAME_MAX_LENGTH),
  level: z.nativeEnum(LanguageLevel),
});

export const UpdateProfileEducationSkillsDtoSchema = z.object({
  body: z.object({
    qualification: enumOrEmpty(JobQualification),
    specialization: enumOrEmpty(JobSpecialization),
    institution: nullableTrimmedString(PROFILE_CONSTANTS.LIMITS.INSTITUTION_MAX_LENGTH),
    graduationYear: z.preprocess(
      blankToUndefined,
      z.coerce
        .number()
        .int()
        .min(PROFILE_CONSTANTS.LIMITS.GRADUATION_YEAR_MIN)
        .max(currentYear + PROFILE_CONSTANTS.LIMITS.GRADUATION_YEAR_MAX_OFFSET)
        .optional()
    ),
    skills: z.array(SkillSchema).max(PROFILE_CONSTANTS.LIMITS.SKILLS_MAX_COUNT),
    languages: z.array(LanguageSchema).max(PROFILE_CONSTANTS.LIMITS.LANGUAGES_MAX_COUNT),
  }),
});

export type UpdatePersonalProfileDto = z.infer<typeof UpdatePersonalProfileDtoSchema>;
export type UpdateProfileExperienceDto = z.infer<typeof UpdateProfileExperienceDtoSchema>;
export type UpdateProfileEducationSkillsDto = z.infer<typeof UpdateProfileEducationSkillsDtoSchema>;
