import fs from 'fs';
import path from 'path';
import { EwdifahListingScraper } from './ewdifh/ewdifh-listing.scraper';
import { EwdifahDetailScraper } from './ewdifh/ewdifh-detail.scraper';
import { JobEnrichmentService } from './llm/job-enrichment.service';

async function smokeTest() {
  console.log('\n========================================');
  console.log('🔥 SMOKE TEST — ewdifh scraper');
  console.log('========================================\n');

  const allExtractedJobs: any[] = [];

  // ─── TEST 1: Listing Scraper ─────────────────────────────────────
  console.log('📋 TEST 1: Listing page...');
  const listingScraper = new EwdifahListingScraper();
  const listings = await listingScraper.scrape();

  console.log(`   ✅ Found ${listings.length} listings`);

  if (!listings.length) {
    console.error('   ❌ No listings found! Check the CSS selectors.');
    return;
  }

  // ─── TEST 2 & 3: Detail & LLM Enrichment (All listings) ──────────
  console.log('\n📄 Processing all listings...');
  const detailScraper = new EwdifahDetailScraper();
  const enrichmentService = new JobEnrichmentService();

  for (const [index, job] of listings.entries()) {
    console.log(`\n[${index + 1}/${listings.length}] Processing: ${job.title}`);
    try {
      const bodyText = await detailScraper.fetchBodyText(job.jobUrl);
      if (!bodyText) {
        console.warn(`   ⚠️ Empty body text for ${job.jobUrl}`);
        continue;
      }

      console.log(`   ✅ Body text: ${bodyText.length} chars`);

      const result = await enrichmentService.enrich(bodyText, job.jobUrl);
      console.log(`   ✅ LLM extracted ${result.jobs.length} job(s)`);

      allExtractedJobs.push(...result.jobs);

      result.jobs.forEach((extractedJob, i) => {
        console.log(
          `      (${i + 1}) ${extractedJob.title} @ ${extractedJob.companyName} | ${extractedJob.location}`
        );
      });
    } catch (err: any) {
      console.error(`   ❌ Failed: ${err.message}`);
    }
  }

  // ─── SAVE TO FILE ────────────────────────────────────────────────
  const outputPath = path.join(process.cwd(), 'scraped-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(allExtractedJobs, null, 2), 'utf8');
  console.log(`\n💾 Saved ${allExtractedJobs.length} jobs to: ${outputPath}`);

  console.log('========================================');
  console.log('✅ SMOKE TEST PASSED');
  console.log('========================================\n');
}

smokeTest().catch((err) => {
  console.error('\n❌ SMOKE TEST FAILED:', err.message);
  console.error(err.stack);
  process.exit(1);
});
