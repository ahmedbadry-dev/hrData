import { appConfig } from '@/config/env.config';

const BASE_URL = appConfig.appUrl.replace(/\/+$/, '');

export const generateTrackingPixelUrl = (token: string): string => {
  return `${BASE_URL}/api/v1/track/open/${token}`;
};

export const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'base64'
);
