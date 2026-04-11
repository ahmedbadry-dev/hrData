import type { JobLocation } from 'generated/prisma';
import { llmClient } from '@/config/llm';
import logger from '@/shared/utils/logger.util';

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
  private readonly apiUrl = `${llmClient.baseUrl || 'https://openrouter.ai/api/v1'}/chat/completions`;
  private readonly model = 'google/gemma-4-31b-it:free';

  async enrich(bodyText: string, sourceUrl: string): Promise<JobEnrichmentResponse> {
    if (!llmClient.isConfigured) {
      throw new Error('LLM is not configured (missing OpenRouter API key)');
    }

    const prompt = this.buildPrompt(bodyText, sourceUrl);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${llmClient.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://kafoo.ai',
          'X-Title': 'Kafoo App',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          reasoning: { enabled: true },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
      }

      const result = (await response.json()) as any;
      const assistantMessage = result.choices[0].message;
      const rawText = assistantMessage.content || '';

      // If we needed to continue the conversation in the future,
      // we would preserve assistantMessage.reasoning_details

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
