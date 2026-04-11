import { getEnvVariable } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';

const llmApiKey = getEnvVariable('GROQ_API_KEY', '');

export const llmClient = {
  isConfigured: Boolean(llmApiKey),
  apiKey: llmApiKey,
};

if (!llmApiKey) {
  logger.warn('Groq API key not configured — LLM features will be unavailable');
}
