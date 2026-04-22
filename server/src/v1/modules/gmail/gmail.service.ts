import { createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaClient } from '@generated/prisma';

import { gmailOAuthConfig, jwtConfig } from '@/config/env.config';
import { UnauthorizedException } from '@/shared/errors/UnauthorizedException';
import { BadRequestException } from '@/shared/errors/BadRequestException';

const GOOGLE_OAUTH_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_OAUTH_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;
const GmailAddressSchema = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface GmailOAuthState {
  userId: string;
  t: number;
}

interface GoogleTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

interface GoogleUserInfoResponse {
  email?: string;
}

export class GmailService {
  constructor(private readonly prisma: PrismaClient) {}

  async createAuthUrl(userId: string): Promise<{ authUrl: string }> {
    this.assertConfigured();

    const state = this.createSignedState({ userId, t: Date.now() });

    const params = new URLSearchParams({
      client_id: gmailOAuthConfig.clientId,
      redirect_uri: gmailOAuthConfig.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      scope: gmailOAuthConfig.scope,
      state,
    });

    return {
      authUrl: `${GOOGLE_OAUTH_AUTHORIZE_URL}?${params.toString()}`,
    };
  }

  async connectWithAuthorizationCode(code: string, state: string): Promise<void> {
    this.assertConfigured();

    const decodedState = this.decodeState(state);

    if (Date.now() - decodedState.t > OAUTH_STATE_MAX_AGE_MS) {
      throw new UnauthorizedException('OAuth state has expired');
    }

    const tokenData = await this.exchangeAuthorizationCode(code);
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      throw new BadRequestException('Google OAuth did not return an access token');
    }

    const profile = await this.fetchGoogleProfile(accessToken);
    if (!profile.email || !GmailAddressSchema.test(profile.email)) {
      throw new BadRequestException('Google account email is missing');
    }

    const existingToken = await this.prisma.gmailToken.findUnique({
      where: { userId: decodedState.userId },
      select: { refreshToken: true },
    });

    const refreshToken = tokenData.refresh_token ?? existingToken?.refreshToken ?? null;
    if (!refreshToken) {
      throw new BadRequestException('Google OAuth did not return a refresh token');
    }

    const tokenExpiry = new Date(Date.now() + (tokenData.expires_in ?? 3600) * 1000);

    await this.prisma.gmailToken.upsert({
      where: { userId: decodedState.userId },
      update: {
        accessToken,
        refreshToken,
        tokenExpiry,
        email: profile.email,
      },
      create: {
        userId: decodedState.userId,
        accessToken,
        refreshToken,
        tokenExpiry,
        email: profile.email,
      },
    });
  }

  async disconnect(userId: string): Promise<void> {
    await this.prisma.gmailToken.deleteMany({ where: { userId } });
  }

  async getConnectionStatus(userId: string): Promise<{ connected: boolean; email: string | null }> {
    const token = await this.prisma.gmailToken.findUnique({
      where: { userId },
      select: { email: true },
    });

    return {
      connected: Boolean(token),
      email: token?.email ?? null,
    };
  }

  private createSignedState(state: GmailOAuthState): string {
    const payloadBase64 = Buffer.from(JSON.stringify(state), 'utf8').toString('base64url');
    const signature = this.signStatePayload(payloadBase64);
    return `${payloadBase64}.${signature}`;
  }

  private decodeState(state: string): GmailOAuthState {
    try {
      const [payloadBase64, signature] = state.split('.');
      if (!payloadBase64 || !signature) {
        throw new Error('Invalid state format');
      }

      const expectedSignature = this.signStatePayload(payloadBase64);
      const receivedBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);
      if (
        receivedBuffer.length !== expectedBuffer.length ||
        !timingSafeEqual(receivedBuffer, expectedBuffer)
      ) {
        throw new Error('Invalid state signature');
      }

      const payload = Buffer.from(payloadBase64, 'base64url').toString('utf8');
      const parsed = JSON.parse(payload) as GmailOAuthState;
      if (!parsed.userId || typeof parsed.t !== 'number') {
        throw new Error('Invalid state');
      }
      return parsed;
    } catch {
      throw new UnauthorizedException('Invalid OAuth state');
    }
  }

  private signStatePayload(payloadBase64: string): string {
    return createHmac('sha256', jwtConfig.accessSecret).update(payloadBase64).digest('base64url');
  }

  private async exchangeAuthorizationCode(code: string): Promise<GoogleTokenResponse> {
    const body = new URLSearchParams({
      code,
      client_id: gmailOAuthConfig.clientId,
      client_secret: gmailOAuthConfig.clientSecret,
      redirect_uri: gmailOAuthConfig.redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to exchange authorization code with Google');
    }

    return (await response.json()) as GoogleTokenResponse;
  }

  private async fetchGoogleProfile(accessToken: string): Promise<GoogleUserInfoResponse> {
    const response = await fetch(GOOGLE_OAUTH_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch Google account profile');
    }

    return (await response.json()) as GoogleUserInfoResponse;
  }

  private assertConfigured(): void {
    if (!gmailOAuthConfig.clientId || !gmailOAuthConfig.clientSecret) {
      throw new BadRequestException('Gmail OAuth is not configured');
    }
  }
}
