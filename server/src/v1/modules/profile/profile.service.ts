import {
  Prisma,
  PrismaClient,
  UserExperience,
  UserLanguage,
  UserProfile,
  UserSkill,
} from '@prisma/client';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import { ConflictException } from '@/shared/errors/ConflictException';
import { PROFILE_CONSTANTS } from './profile.constants';
import {
  UpdatePersonalProfileDto,
  UpdateProfileEducationSkillsDto,
  UpdateProfileExperienceDto,
} from './dto/profile.dto';
import {
  ProfileEducationResponse,
  ProfileExperienceResponse,
  ProfileLanguageResponse,
  ProfilePersonalResponse,
  ProfileResponse,
} from './types/profile.types';

interface ProfileLookupResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profile: UserProfile | null;
  experiences: UserExperience[];
  skills: UserSkill[];
  languages: UserLanguage[];
}

export class ProfileService {
  constructor(private readonly prisma: PrismaClient) {}

  async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await this.findProfileUser(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.mapProfileResponse(user);
  }

  async updatePersonal(
    userId: string,
    data: UpdatePersonalProfileDto['body']
  ): Promise<ProfileResponse> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone ?? null,
          },
        });

        await tx.userProfile.upsert({
          where: { userId },
          create: {
            userId,
            summary: data.summary ?? null,
          },
          update: {
            summary: data.summary ?? null,
          },
        });

        await this.logActivity(tx, userId, 'UPDATE_PROFILE');
      });
    } catch (error) {
      this.handleKnownWriteError(error);
    }

    return this.getProfile(userId);
  }

  async updateExperience(
    userId: string,
    data: UpdateProfileExperienceDto['body']
  ): Promise<ProfileResponse> {
    const experiences = data.experiences.map((experience, index) => ({
      userId,
      jobTitle: this.cleanText(experience.jobTitle),
      company: this.cleanText(experience.company),
      startDate: this.parseMonth(experience.startDate),
      endDate: experience.endDate ? this.parseMonth(experience.endDate) : null,
      description: experience.description ? this.cleanText(experience.description) : null,
      sortOrder: index,
    }));

    await this.prisma.$transaction(async (tx) => {
      await tx.userExperience.deleteMany({ where: { userId } });

      if (experiences.length > 0) {
        await tx.userExperience.createMany({ data: experiences });
      }

      await this.logActivity(tx, userId, 'UPDATE_PROFILE_EXPERIENCE');
    });

    return this.getProfile(userId);
  }

  async updateEducationSkills(
    userId: string,
    data: UpdateProfileEducationSkillsDto['body']
  ): Promise<ProfileResponse> {
    const skills = data.skills.map((skill, index) => {
      const name = this.cleanText(skill);
      return {
        userId,
        name,
        normalizedName: this.normalizeName(name),
        sortOrder: index,
      };
    });

    const languages = data.languages.map((language, index) => {
      const name = this.cleanText(language.name);
      return {
        userId,
        name,
        normalizedName: this.normalizeName(name),
        level: language.level,
        sortOrder: index,
      };
    });

    this.assertNoDuplicates(
      skills.map((skill) => skill.normalizedName),
      PROFILE_CONSTANTS.MESSAGES.DUPLICATE_SKILL,
      'skills'
    );
    this.assertNoDuplicates(
      languages.map((language) => language.normalizedName),
      PROFILE_CONSTANTS.MESSAGES.DUPLICATE_LANGUAGE,
      'languages'
    );

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.userProfile.upsert({
          where: { userId },
          create: {
            userId,
            qualification: data.qualification ?? null,
            specialization: data.specialization ?? null,
            institution: data.institution ?? null,
            graduationYear: data.graduationYear ?? null,
          },
          update: {
            qualification: data.qualification ?? null,
            specialization: data.specialization ?? null,
            institution: data.institution ?? null,
            graduationYear: data.graduationYear ?? null,
          },
        });

        await tx.userSkill.deleteMany({ where: { userId } });
        if (skills.length > 0) {
          try {
            await tx.userSkill.createMany({ data: skills });
          } catch (error) {
            this.handleKnownWriteError(error, PROFILE_CONSTANTS.MESSAGES.DUPLICATE_SKILL);
          }
        }

        await tx.userLanguage.deleteMany({ where: { userId } });
        if (languages.length > 0) {
          try {
            await tx.userLanguage.createMany({ data: languages });
          } catch (error) {
            this.handleKnownWriteError(error, PROFILE_CONSTANTS.MESSAGES.DUPLICATE_LANGUAGE);
          }
        }

        await this.logActivity(tx, userId, 'UPDATE_PROFILE_EDUCATION_SKILLS');
      });
    } catch (error) {
      this.handleKnownWriteError(error);
    }

    return this.getProfile(userId);
  }

  private findProfileUser(userId: string): Promise<ProfileLookupResult | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profile: true,
        experiences: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
        skills: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
        languages: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
  }

  private mapProfileResponse(user: ProfileLookupResult): ProfileResponse {
    return {
      profile: this.mapPersonalProfile(user),
      experience: user.experiences.map((experience): ProfileExperienceResponse => {
        return {
          id: experience.id,
          jobTitle: experience.jobTitle,
          company: experience.company,
          startDate: this.formatMonth(experience.startDate),
          endDate: experience.endDate ? this.formatMonth(experience.endDate) : '',
          description: experience.description ?? '',
        };
      }),
      skills: user.skills.map((skill) => skill.name),
      languages: user.languages.map((language): ProfileLanguageResponse => {
        return {
          id: language.id,
          name: language.name,
          level: language.level,
        };
      }),
      education: this.mapEducationProfile(user.profile),
    };
  }

  private mapPersonalProfile(user: ProfileLookupResult): ProfilePersonalResponse {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? '',
      summary: user.profile?.summary ?? '',
    };
  }

  private mapEducationProfile(profile: ProfileLookupResult['profile']): ProfileEducationResponse {
    return {
      qualification: profile?.qualification ?? '',
      specialization: profile?.specialization ?? '',
      institution: profile?.institution ?? '',
      graduationYear: profile?.graduationYear ? String(profile.graduationYear) : '',
    };
  }

  private parseMonth(value: string): Date {
    const [year, month] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1));
  }

  private formatMonth(value: Date): string {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private cleanText(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  private normalizeName(value: string): string {
    return this.cleanText(value).toLocaleLowerCase();
  }

  private assertNoDuplicates(
    values: string[],
    message: string,
    fieldPrefix: 'skills' | 'languages'
  ): void {
    const seen = new Set<string>();

    for (let index = 0; index < values.length; index++) {
      const value = values[index];
      if (seen.has(value)) {
        throw new BadRequestException(message, [
          {
            field:
              fieldPrefix === 'languages'
                ? `${fieldPrefix}.${index}.name`
                : `${fieldPrefix}.${index}`,
            message,
          },
        ]);
      }
      seen.add(value);
    }
  }

  private async logActivity(
    tx: Prisma.TransactionClient,
    userId: string,
    action: string
  ): Promise<void> {
    await tx.activityLog.create({
      data: {
        userId,
        action,
        entityType: 'profile',
        entityId: userId,
      },
    });
  }

  private handleKnownWriteError(
    error: unknown,
    duplicateNormalizedNameMessage: string = PROFILE_CONSTANTS.MESSAGES.DUPLICATE_SKILL
  ): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const rawTarget = error.meta?.target;
      const target = (
        Array.isArray(rawTarget)
          ? rawTarget.join(',')
          : typeof rawTarget === 'string'
            ? rawTarget
            : ''
      ).toLocaleLowerCase();

      if (target.includes('phone')) {
        throw new ConflictException(PROFILE_CONSTANTS.MESSAGES.PHONE_ALREADY_IN_USE);
      }

      if (target.includes('normalizedname') || target.includes('normalized_name')) {
        throw new ConflictException(duplicateNormalizedNameMessage);
      }
    }

    throw error;
  }
}
