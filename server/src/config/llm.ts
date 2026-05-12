// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/config/llm.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { getEnvVariable } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';
import { GoogleGenAI } from '@google/genai';

const groqApiKey = getEnvVariable('GROQ_API_KEY', '');
const rawBaseUrl = getEnvVariable('LLM_BASE_URL', '');

export const llmClient = {
  isConfigured: Boolean(groqApiKey),
  apiKey: groqApiKey,
  baseUrl: rawBaseUrl,
};

if (!groqApiKey) {
  logger.warn('GROQ API key not configured — LLM features will be unavailable');
}

const geminiApiKey = getEnvVariable('GEMINI_API_KEY', '');
const geminiBaseUrl = getEnvVariable('GEMINI_BASE_URL', '');

export const geminiClient = new GoogleGenAI({
  apiKey: geminiApiKey,
  ...(geminiBaseUrl
    ? {
        httpOptions: {
          baseUrl: geminiBaseUrl,
        },
      }
    : {}),
});

if (!geminiApiKey) {
  logger.warn('[Gemini] API key not configured — Scraper AI features will be unavailable');
} else {
  logger.info('[Gemini] ✅ Client initialized');
}
