import type { JobLocation } from 'generated/prisma';
import { llmClient } from '@/config/llm';
import logger from '@/shared/utils/logger.util';
import { Groq } from 'groq-sdk';

export interface JobEnrichmentResult {
  title: string;
  companyName: string;
  source: string;
  location: JobLocation | null;
  category: string | null;
  description: string | null;
  hrEmail: string | null;
  sourceUrl: string;
  language: 'ar' | 'en';
  postedAt: string | null;
  expiresAt: string | null;
}

export interface JobEnrichmentResponse {
  jobs: JobEnrichmentResult[];
}

export class JobEnrichmentService {
  private groq: Groq | null = null;

  constructor() {
    if (llmClient.isConfigured) {
      // pass baseURL if customized, else rely on groq default
      const options: any = { apiKey: llmClient.apiKey };
      if (llmClient.baseUrl) {
        options.baseURL = llmClient.baseUrl;
      }
      this.groq = new Groq(options);
    }
  }

  async enrich(bodyText: string, sourceUrl: string): Promise<JobEnrichmentResponse> {
    if (!llmClient.isConfigured || !this.groq) {
      throw new Error('LLM is not configured (missing GROQ API key)');
    }

    const prompt = this.buildPrompt(bodyText, sourceUrl);

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'qwen/qwen3-32b',
        temperature: 0.6,
        max_completion_tokens: 4096,
        top_p: 0.95,
        stream: true,
        reasoning_effort: 'default',
        stop: null,
      });

      let rawText = '';
      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        rawText += content;
        process.stdout.write(content);
      }

      console.log(''); // Newline after stream finishes

      // Clean markdown code blocks if the model wrapped the JSON
      const cleanText = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      return this.parseResponse(cleanText, sourceUrl);
    } catch (err: any) {
      logger.error(`[JobEnrichmentService] Error extracting jobs: ${err.message}`);
      throw err;
    }
  }

  private buildPrompt(bodyText: string, sourceUrl: string): string {
    return `
أنت نظام لاستخراج بيانات الوظائف من إعلانات التوظيف العربية.

القواعد:
- استخرج كل وظيفة مذكورة كـ object منفصل.
- عنوان الوظيفة (title) يكون المسمى الوظيفي فقط (مثال: "معلمة رياضيات").
- لا تضع عناوين مثل "فتح باب التقديم" أو "تعلن عن وظائف".
- المعلومات المشتركة (الشركة، المدينة، الإيميل، التواريخ) تتكرر في كل object.
- قيم location المسموحة فقط:
  RIYADH | JEDDAH | DAMMAM | MECCA | MEDINA | ABHA | TABUK | REMOTE | OTHER | null

أعد JSON فقط بدون أي نص آخر:
{
  "jobs": [
    {
      "title": "المسمى الوظيفي المختصر",
      "companyName": "اسم الشركة",
      "source": "أي وظيفة",
      "location": "إحدى القيم أعلاه أو null",
      "category": "تصنيف الوظيفة",
      "description": "ملخص في جملة أو جملتين",
      "hrEmail": "البريد أو null",
      "sourceUrl": "${sourceUrl}",
      "language": "ar",
      "postedAt": "ISO datetime أو null",
      "expiresAt": "ISO datetime أو null"
    }
  ]
}

الإعلان:
${bodyText.substring(0, 4000)}
`;
  }

  private parseResponse(rawText: string, sourceUrl: string): JobEnrichmentResponse {
    try {
      const parsed = JSON.parse(rawText) as JobEnrichmentResponse;

      if (!Array.isArray(parsed.jobs)) {
        throw new Error('Missing "jobs" array in LLM response');
      }

      parsed.jobs = parsed.jobs.filter((j) => j.title?.trim());

      return parsed;
    } catch (err: any) {
      throw new Error(`LLM parse error for ${sourceUrl}: ${err.message}`);
    }
  }
}

export const jobEnrichmentService = new JobEnrichmentService();
