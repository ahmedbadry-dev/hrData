import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ListingCard {
  sourceId: string;
  title: string;
  company: string;
  jobUrl: string;
}

export class EwdifahListingScraper {
  private readonly url = 'https://www.ewdifh.com/category/all-jobs';
  private readonly headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  };

  async scrape(): Promise<ListingCard[]> {
    const html = await this.fetchHtml();
    return this.parseCards(html);
  }

  private async fetchHtml(): Promise<string> {
    const { data } = await axios.get(this.url, {
      headers: this.headers,
      timeout: 20_000,
    });
    return data;
  }

  private parseCards(html: string): ListingCard[] {
    const $ = cheerio.load(html);
    const cards: ListingCard[] = [];

    const cardElements = $('div.grid').find('> div.bg-white');

    cardElements.each((_: number, el: any) => {
      const $card = $(el);

      const anchor = $card.find('div.text-base.font-semibold a');
      const title = anchor.text().trim();
      const jobUrl = anchor.attr('href') || '';

      const sourceId = jobUrl.split('/jobs/')[1]?.split(/[?#]/)[0]?.trim();
      if (!sourceId || !title) return;

      const company = $card.find('a[href*="/job/org/"]').text().trim();

      cards.push({ sourceId, title, company, jobUrl });
    });

    return cards;
  }
}
