import { getEnvVariable } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';

const groqApiKey = getEnvVariable('GROQ_API_KEY', '');
const rawBaseUrl = getEnvVariable('LLM_BASE_URL', '');

export const llmClient = {
  isConfigured: Boolean(groqApiKey),
  apiKey: groqApiKey,
  baseUrl: rawBaseUrl, // optional, for customized endpoint if really needed
};

if (!groqApiKey) {
  logger.warn('GROQ API key not configured — LLM features will be unavailable');
}
