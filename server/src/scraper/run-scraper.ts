import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';

interface JobListing {
  sourceId: string;
  title: string;
  company: string;
  jobUrl: string;
}

interface JobDetail {
  sourceId: string;
  title: string;
  company: string;
  jobUrl: string;
  bodyText: string;
}

async function scrapeListings(): Promise<JobListing[]> {
  const url = 'https://www.ewdifh.com/category/all-jobs';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  };

  console.log('📥 Fetching listings page...');
  const { data: html } = await axios.get(url, { headers, timeout: 30_000 });

  const $ = cheerio.load(html);
  const cards: JobListing[] = [];

  $('div.grid')
    .find('> div.bg-white')
    .each((_: number, el: any) => {
      const $card = $(el);
      const anchor = $card.find('div.text-base.font-semibold a');
      const title = anchor.text().trim();
      const jobUrl = anchor.attr('href') || '';
      const sourceId = jobUrl.split('/jobs/')[1]?.split(/[?#]/)[0]?.trim();
      const company = $card.find('a[href*="/job/org/"]').text().trim();

      if (sourceId && title) {
        cards.push({ sourceId, title, company, jobUrl });
      }
    });

  return cards;
}

async function fetchJobDetail(jobUrl: string): Promise<string> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  };

  const { data: html } = await axios.get(jobUrl, { headers, timeout: 30_000 });
  const $ = cheerio.load(html);

  $('.card-body').find('ins.adsbygoogle, script, iframe').remove();

  const bodyText = $('.card-body').text().replace(/\s+/g, ' ').trim();

  return bodyText || $('meta[name="description"]').attr('content') || '';
}

async function main() {
  console.log('🚀 Starting Ewdifah scraper...\n');

  const listings = await scrapeListings();
  console.log(`✅ Found ${listings.length} job listings\n`);

  const jobs: JobDetail[] = [];
  const batchSize = 5;

  for (let i = 0; i < listings.length; i += batchSize) {
    const batch = listings.slice(i, i + batchSize);
    console.log(
      `📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(listings.length / batchSize)} (${i + 1}-${i + batch.length})...`
    );

    const results = await Promise.all(
      batch.map(async (listing) => {
        try {
          const bodyText = await fetchJobDetail(listing.jobUrl);
          return { ...listing, bodyText };
        } catch (err) {
          console.error(`  ❌ Failed: ${listing.jobUrl}`);
          return null;
        }
      })
    );

    jobs.push(...results.filter((r): r is JobDetail => r !== null));
  }

  const outputDir = path.resolve(process.cwd(), 'data');
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'ewdifh-jobs.json');
  await fs.writeFile(outputPath, JSON.stringify(jobs, null, 2), 'utf-8');

  console.log(`\n✅ Done! Saved ${jobs.length} jobs to ${outputPath}`);
}

main().catch(console.error);
