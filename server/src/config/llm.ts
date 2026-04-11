import { getEnvVariable } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';

const llmApiKey = getEnvVariable('OPEN_ROUTER_API_KEY', '');
const rawBaseUrl = getEnvVariable('LLM_BASE_URL', '');
const llmBaseUrl = rawBaseUrl || 'https://openrouter.ai/api/v1';

export const llmClient = {
  isConfigured: Boolean(llmApiKey),
  apiKey: llmApiKey,
  baseUrl: llmBaseUrl,
};

if (!llmApiKey) {
  logger.warn('OpenRouter API key not configured — LLM features will be unavailable');
}
