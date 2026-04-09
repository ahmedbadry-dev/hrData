import { getEnvVariable } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';

const llmApiKey = getEnvVariable('LLM_API_KEY', '');

export const llmClient = {
  isConfigured: Boolean(llmApiKey),
  apiKey: llmApiKey,
  baseUrl: getEnvVariable('LLM_BASE_URL', ''),
};

if (!llmApiKey) {
  logger.warn('LLM API key not configured — LLM features will be unavailable');
}
