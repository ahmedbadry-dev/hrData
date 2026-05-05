import { PrismaClient, User, UserStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import { UnauthorizedException } from '@/shared/errors/UnauthorizedException';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { ConflictException } from '@/shared/errors/ConflictException';
import { ForbiddenException } from '@/shared/errors/ForbiddenException';
import logger from '@/shared/utils/logger.util';
import redis from '@/config/redis';
import { CreateUserDto } from './dto/create-user.dto';
import { generateHash, compareHash, generateHashedWithSha256 } from '@/shared/utils/hash.util';
import {
  generateTempToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyTempToken,
  generateTokenPair,
} from '@/shared/utils/jwt.util';
import { excludePassword } from '@/shared/utils/exclude-password.utils';
import { NotificationsService, notificationsService } from '@/notifications/notifications.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthResponseWithTokens,
  AuthResponseWithTwoFactor,
  AuthResponseWithoutTokens,
  DeviceInfo,
} from './types/auth.types';

import { AUTH_CONSTANTS } from './auth.constants';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const FORGOT_PASSWORD_RESPONSE = {
  message: 'If the account exists and is eligible, a password reset link will be sent.',
};

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
      throw new BadRequestException('phone already in use');
    }

    const emailExists = await this.prisma.user.findUnique({
      where: { email },
    });
    if (emailExists) {
      throw new BadRequestException('email already in use');
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

    this.emailService
      .sendVerificationEmail(firstName + ' ' + lastName, email, emailVerifyToken)
      .catch((emailError) => {
        logger.error('❌ Failed to send verification email:', { email, error: emailError });
      });

    void this.prisma.activityLog
      .create({
        data: { userId: user.id, action: 'REGISTER' },
      })
      .catch((err) => logger.error('Failed to log REGISTER activity', err));

    return { user: excludePassword(user) };
  }

  async verifyEmail(data: VerifyEmailDto['query']) {
    const { token } = data;
    const verificationToken = verifyTempToken(token);

    if (!verificationToken.valid || verificationToken.payload.type !== 'VERIFICATION') {
      throw new BadRequestException('Invalid verification token');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { email: verificationToken.payload.email },
    });

    if (!userExists) {
      throw new BadRequestException('Invalid verification token');
    }

    const hashedToken = generateHashedWithSha256(token);

    if (userExists.verificationToken !== hashedToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (userExists.emailVerified) {
      return excludePassword(userExists);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userExists.id },
      data: { emailVerified: true, verificationToken: null, status: UserStatus.ACTIVE },
    });

    void this.prisma.activityLog
      .create({
        data: { userId: updatedUser.id, action: 'VERIFY_EMAIL' },
      })
      .catch((err) => logger.error('Failed to log VERIFY_EMAIL activity', err));

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

  async logout(userId: string, accessToken: string, refreshToken: string): Promise<void> {
    const verifiedAccess = verifyAccessToken(accessToken);
    if (verifiedAccess.valid && verifiedAccess.payload.tokenId) {
      const ttlMs = verifiedAccess.payload.exp
        ? verifiedAccess.payload.exp * 1000 - Date.now()
        : 15 * 60 * 1000;
      if (ttlMs > 0) {
        await redis.set(`blacklist:token:${verifiedAccess.payload.tokenId}`, '1', 'PX', ttlMs);
      }
    }

    const verified = verifyRefreshToken(refreshToken);
    if (verified.valid && verified.payload.tokenId) {
      const ttlMs = verified.payload.exp
        ? verified.payload.exp * 1000 - Date.now()
        : 7 * 24 * 60 * 60 * 1000;
      if (ttlMs > 0) {
        await redis.set(`blacklist:token:${verified.payload.tokenId}`, '1', 'PX', ttlMs);
      }
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await redis.incr(`user:token-gen:${userId}`);
    await redis.expire(`user:token-gen:${userId}`, 7 * 24 * 60 * 60);
  }

  async refresh(refreshToken: string, deviceInfo: DeviceInfo): Promise<AuthResponseWithTokens> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const verifiedToken = verifyRefreshToken(refreshToken);
    if (!verifiedToken.valid || verifiedToken.payload.type !== 'REFRESH') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: verifiedToken.payload.userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.validateUserStatus(user);

    return this.createTokenPairAndSession(user, deviceInfo);
  }

  async forgotPassword(data: ForgotPasswordDto['body']) {
    const { email } = data;
    const userExists = await this.prisma.user.findUnique({
      where: { email, status: UserStatus.ACTIVE },
    });

    if (!userExists) {
      return FORGOT_PASSWORD_RESPONSE;
    }
    if (!userExists.emailVerified) {
      return FORGOT_PASSWORD_RESPONSE;
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

    this.emailService
      .sendPasswordResetEmail(
        updatedUser.firstName + ' ' + updatedUser.lastName,
        updatedUser.email,
        resetToken
      )
      .catch((emailError) => {
        logger.error('❌ Failed to send password reset email:', {
          email: updatedUser.email,
          error: emailError,
        });
      });

    return FORGOT_PASSWORD_RESPONSE;
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

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
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
      return updated;
    });

    void this.prisma.activityLog
      .create({
        data: { userId: updatedUser.id, action: 'RESET_PASSWORD' },
      })
      .catch((err) => logger.error('Failed to log RESET_PASSWORD activity', err));

    return { user: excludePassword(updatedUser) };
  }

  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    const verifiedToken = verifyTempToken(token);
    if (!verifiedToken.valid) {
      throw new UnauthorizedException('Invalid or expired reset token');
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
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Reset token has expired');
    }

    return { valid: true };
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

    if (user.passwordHash) {
      const isSamePassword = await compareHash(newPassword, user.passwordHash);
      if (isSamePassword) {
        throw new BadRequestException('New password must differ from current password');
      }
    }

    const hashedPassword = await generateHash(newPassword);

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      });
      return updated;
    });

    void this.prisma.activityLog
      .create({
        data: {
          userId: updatedUser.id,
          action: 'CHANGE_PASSWORD',
        },
      })
      .catch((err) => logger.error('Failed to log CHANGE_PASSWORD activity', err));

    return { user: excludePassword(updatedUser) };
  }

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

    // We no longer save sessions to the database as requested.
    // The system is now stateless.

    void this.prisma.activityLog
      .create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          metadata: { ipAddress: deviceInfo.ipAddress },
          ipAddress: deviceInfo.ipAddress,
        },
      })
      .catch((err) => logger.error('Failed to log LOGIN activity', err));

    return { user: excludePassword(user), tokens: tokenPair };
  }
}
