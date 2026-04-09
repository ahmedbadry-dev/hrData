import { PrismaClient, User, UserStatus } from 'generated/prisma';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import { UnauthorizedException } from '@/shared/errors/UnauthorizedException';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { ConflictException } from '@/shared/errors/ConflictException';
import { ForbiddenException } from '@/shared/errors/ForbiddenException';
import { APP_CONSTANTS } from '@/config/constants';
import { CreateUserDto } from './dto/create-user.dto';
import { generateHash, compareHash, generateHashedWithSha256 } from '@/shared/utils/hash.util';
import {
  generateTempToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyTempToken,
  generateTokenPair,
} from '@/shared/utils/jwt.util';
import { excludePassword } from '@/shared/utils/exclude-password.utils';
import { env, appConfig, jwtConfig, emailConfig } from '@/config/env.config';
import { NotificationsService, notificationsService } from '@/notifications/notifications.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthResponseWithTokens,
  AuthResponseWithTwoFactor,
  AuthResponseWithoutTokens,
  DeviceInfo,
} from './types/auth.types';
// Prisma types now imported from Line 1
import { AUTH_CONSTANTS } from './auth.constants';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly emailService: NotificationsService = notificationsService
  ) {}

  async register(data: CreateUserDto['body']) {
    const { firstName, lastName, email, phone, password } = data;

    const phoneExists = await this.prisma.user.findUnique({
      where: { phone },
    });
    if (phoneExists) {
      throw new BadRequestException('Phone already exists');
    }

    const emailExists = await this.prisma.user.findUnique({
      where: { email },
    });
    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await generateHash(password);
    const emailVerifyToken = generateTempToken({
      email,
      type: 'VERIFICATION',
    });
    const hashedVerificationToken = generateHashedWithSha256(emailVerifyToken);

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash: hashedPassword,
        verificationToken: hashedVerificationToken,
        phone,
      },
    });

    this.emailService.sendVerificationEmail(firstName + ' ' + lastName, email, emailVerifyToken);

    return { user: excludePassword(user) };
  }

  async verifyEmail(data: VerifyEmailDto['query']) {
    const { token } = data;
    const hashedToken = generateHashedWithSha256(token);

    const userExists = await this.prisma.user.findFirst({
      where: {
        verificationToken: hashedToken,
        emailVerified: false,
      },
    });
    if (!userExists) {
      throw new BadRequestException('Invalid verification token');
    }

    const verificationToken = verifyTempToken(token);
    if (!verificationToken.valid) {
      throw new BadRequestException('Invalid verification token');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userExists.id },
      data: { emailVerified: true, verificationToken: null, status: UserStatus.ACTIVE },
    });

    return excludePassword(updatedUser);
  }

  async login(
    data: LoginDto['body'],
    deviceInfo: DeviceInfo
  ): Promise<AuthResponseWithTokens | AuthResponseWithTwoFactor> {
    const { email, password } = data;
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!userExists || !userExists.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.checkAccountLockout(userExists);

    const isPasswordCorrect = await compareHash(password, userExists.passwordHash);
    if (!isPasswordCorrect) {
      await this.incrementFailedLoginAttempts(userExists);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.resetFailedLoginAttempts(userExists);

    this.validateUserStatus(userExists);

    return this.createTokenPairAndSession(userExists, deviceInfo);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    const hashedRefreshToken = generateHashedWithSha256(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashedRefreshToken, userId },
    });
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.prisma.session.delete({
      where: { tokenHash: hashedRefreshToken, userId },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async refresh(refreshToken: string, deviceInfo: DeviceInfo): Promise<AuthResponseWithTokens> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const verifiedToken = verifyRefreshToken(refreshToken);
    if (!verifiedToken.valid || verifiedToken.payload.type !== 'REFRESH') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = generateHashedWithSha256(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { tokenHash, userId: verifiedToken.payload.userId },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: verifiedToken.payload.userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.validateUserStatus(user);

    await this.prisma.session.delete({ where: { id: session.id } });

    return this.createTokenPairAndSession(user, deviceInfo);
  }

  async forgotPassword(data: ForgotPasswordDto['body']) {
    const { email } = data;
    const userExists = await this.prisma.user.findUnique({
      where: { email, status: UserStatus.ACTIVE },
    });

    if (!userExists) {
      throw new BadRequestException('User not found or inactive');
    }
    if (!userExists.emailVerified) {
      throw new BadRequestException('Please verify your email first');
    }

    const resetToken = generateTempToken({
      email: userExists.email,
      type: 'PASSWORD_RESET',
    });
    const hashedResetToken = generateHashedWithSha256(resetToken);

    const updatedUser = await this.prisma.user.update({
      where: { id: userExists.id },
      data: {
        resetToken: hashedResetToken,
        resetTokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    this.emailService.sendPasswordResetEmail(
      updatedUser.firstName + ' ' + updatedUser.lastName,
      updatedUser.email,
      resetToken
    );

    return { user: excludePassword(updatedUser) };
  }

  async resetPassword(
    data: ResetPasswordDto['body'],
    query: ResetPasswordDto['query']
  ): Promise<AuthResponseWithoutTokens> {
    const { token } = query;
    const { password } = data;

    const verifiedToken = verifyTempToken(token);
    if (!verifiedToken.valid) {
      throw new UnauthorizedException('Invalid reset token');
    }
    if (verifiedToken.payload.type !== 'PASSWORD_RESET') {
      throw new UnauthorizedException('Invalid reset token');
    }

    const hashedToken = generateHashedWithSha256(token);
    const user = await this.prisma.user.findUnique({
      where: {
        email: verifiedToken.payload.email,
        resetToken: hashedToken,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid reset token');
    }

    this.validateUserStatus(user);

    if (user.passwordHash) {
      const isPasswordSame = await compareHash(password, user.passwordHash);
      if (isPasswordSame) {
        throw new BadRequestException('Password is same as current password');
      }
    }

    const hashedPassword = await generateHash(password);

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword, resetToken: null, resetTokenExpiresAt: null },
      });
      await tx.session.deleteMany({ where: { userId: user.id } });
      return updated;
    });

    return { user: excludePassword(updatedUser) };
  }

  async changePassword(userId: string, data: ChangePasswordDto['body']) {
    const { currentPassword, newPassword } = data;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.validateUserStatus(user);

    if (user.passwordHash) {
      const isCurrentPasswordValid = await compareHash(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is not correct');
      }
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('New password is same as current password');
    }

    const hashedPassword = await generateHash(newPassword);

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      });
      await tx.session.deleteMany({ where: { userId: user.id } });
      return updated;
    });

    return { user: excludePassword(updatedUser) };
  }

  // HELPER FUNCTIONS
  private generateSessionId = (): string => crypto.randomUUID();

  private validateUserStatus(user: { status: UserStatus; emailVerified: boolean }) {
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account is suspended');
    }
    if (!user.emailVerified) {
      throw new BadRequestException('Please verify your email first');
    }
  }

  private checkAccountLockout(user: User): void {
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      throw new UnauthorizedException(
        `Account is temporarily locked. Try again in ${remainingMinutes} minute(s).`
      );
    }
  }

  private async incrementFailedLoginAttempts(user: User): Promise<void> {
    const newAttempts = user.failedLoginAttempts + 1;
    const updateData: {
      failedLoginAttempts: number;
      lockedUntil?: Date;
    } = {
      failedLoginAttempts: newAttempts,
    };

    if (newAttempts >= AUTH_CONSTANTS.MAX_FAILED_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + AUTH_CONSTANTS.LOCKOUT_DURATION_MS);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
  }

  private async resetFailedLoginAttempts(user: User): Promise<void> {
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }
  }

  private async createTokenPairAndSession(
    user: User,
    deviceInfo: DeviceInfo
  ): Promise<AuthResponseWithTokens> {
    const tokenId = this.generateSessionId();
    const tokenPair = generateTokenPair({
      userId: user.id,
      tokenId,
      role: user.role,
      email: user.email,
    });

    const hashedRefreshToken = generateHashedWithSha256(tokenPair.refreshToken);
    const refreshTokenExpiresAt = new Date(
      Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_MAX_AGE
    );

    await this.prisma.session.create({
      data: {
        id: tokenId,
        userId: user.id,
        tokenHash: hashedRefreshToken,
        expiresAt: refreshTokenExpiresAt,
        deviceName: deviceInfo.deviceName,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
      },
    });

    return { user: excludePassword(user), tokens: tokenPair };
  }
}
