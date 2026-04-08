import { env } from '@/config/env';
import logger from '@/shared/utils/logger.util';

export const llmClient = {
  isConfigured: Boolean(env.LLM_API_KEY),
  apiKey: env.LLM_API_KEY,
  baseUrl: env.LLM_BASE_URL,
};

if (!env.LLM_API_KEY) {
  logger.warn('LLM API key not configured — LLM features will be unavailable');
}
