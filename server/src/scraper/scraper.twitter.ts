import axios from 'axios';
import { ApiSourceConfig, TwitterJob } from './scraper.types';

const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gu;

export class TwitterClient {
  private static readonly httpClient = axios.create({
    timeout: 15000,
    headers: {
      Authorization: '',
      Accept: 'application/json',
    },
  });

  static async verifyApiKey(config: ApiSourceConfig): Promise<{ valid: boolean; error?: string }> {
    if (!config.authToken) {
      return { valid: false, error: 'GETXAPI_KEY not configured' };
    }

    try {
      const response = await this.httpClient.get(config.verifyUrl, {
        headers: { Authorization: `Bearer ${config.authToken}` },
        timeout: 10000,
      });
      return { valid: true };
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        const data = error.response?.data;
        const message = data?.error || data?.message || 'API key invalid or expired';
        const hint = data?.hint ? ` (${data.hint})` : '';
        return { valid: false, error: `401 Unauthorized: ${message}${hint}` };
      }
      return { valid: false, error: `Connection error during verification: ${error.message}` };
    }
  }

  static async searchTweets(
    config: ApiSourceConfig
  ): Promise<{ jobs: TwitterJob[]; error?: string }> {
    const matching: TwitterJob[] = [];
    const seenIds = new Set<string>();

    const chunkSize = 6;
    for (let i = 0; i < config.searchPhrases.length; i += chunkSize) {
      const phrasesChunk = config.searchPhrases.slice(i, i + chunkSize);
      const query = phrasesChunk.map((p) => `"${p}"`).join(' OR ');

      try {
        const response = await this.httpClient.get(config.apiUrl, {
          headers: { Authorization: `Bearer ${config.authToken}` },
          params: { q: query, product: 'Latest' },
          timeout: 10000,
        });

        if (response.status === 401) {
          const data = response.data;
          const message = data?.error || data?.message || 'API key invalid or expired';
          return { jobs: [], error: `401 Unauthorized: ${message}` };
        }

        const tweets: any[] = response.data?.tweets || [];
        for (const tweet of tweets) {
          const tweetId = tweet.id;
          if (seenIds.has(tweetId)) continue;

          const text = tweet.text || '';
          const emails = text.match(EMAIL_REGEX) || [];
          if (emails.length === 0) continue;

          const createdAt = tweet.createdAt;
          matching.push({
            id: tweetId,
            text,
            emails,
            relativeTime: this.getRelativeTime(createdAt),
            sourceUrl: `https://x.com/i/web/status/${tweetId}`,
          });
          seenIds.add(tweetId);
        }
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401) {
          const data = error.response?.data;
          const message = data?.error || data?.message || 'API key invalid or expired';
          return { jobs: [], error: `401 Unauthorized: ${message}` };
        }
        return { jobs: [], error: `API request failed: ${error.message}` };
      }
    }

    return { jobs: matching };
  }

  private static getRelativeTime(dateStr: string): string {
    if (!dateStr) return '';

    const parseDate = (ds: string) => {
      try {
        return new Date(ds);
      } catch {
        return null;
      }
    };

    const tweetDate = parseDate(dateStr);
    if (!tweetDate) return dateStr;

    const now = new Date();
    const diffMs = now.getTime() - tweetDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return 'للتو';
    if (diffSec < 120) return 'قبل دقيقة';
    if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      return `قبل ${mins} دقيقة`;
    }
    if (diffSec < 7200) return 'قبل ساعة';
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return `قبل ${hours} ساعة`;
    }
    if (diffSec < 172800) return 'أمس';
    const days = Math.floor(diffSec / 86400);
    if (days < 30) return `قبل ${days} يوم`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `قبل ${months} شهر`;
    }
    const years = Math.floor(days / 365);
    return `قبل ${years} سنة`;
  }
}
