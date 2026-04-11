/**
 * Smoke test — يشغل الـ scraper مباشرة بدون BullMQ أو Redis
 * شغّله بـ: npx ts-node src/scraper/test-smoke.ts
 */
import { EwdifahListingScraper } from './ewdifh/ewdifh-listing.scraper';
import { EwdifahDetailScraper } from './ewdifh/ewdifh-detail.scraper';
import { JobEnrichmentService } from './llm/job-enrichment.service';

async function smokeTest() {
  console.log('\n========================================');
  console.log('🔥 SMOKE TEST — ewdifh scraper');
  console.log('========================================\n');

  // ─── TEST 1: Listing Scraper ─────────────────────────────────────
  console.log('📋 TEST 1: Listing page...');
  const listingScraper = new EwdifahListingScraper();
  const listings = await listingScraper.scrape();

  console.log(`   ✅ Found ${listings.length} listings`);
  console.log('   First 3 listings:');
  listings.slice(0, 3).forEach((l, i) => {
    console.log(`   [${i + 1}] ${l.title}`);
    console.log(`        Company: ${l.company}`);
    console.log(`        URL: ${l.jobUrl}`);
    console.log(`        ID: ${l.sourceId}`);
  });

  if (!listings.length) {
    console.error('   ❌ No listings found! Check the CSS selectors.');
    return;
  }

  // ─── TEST 2: Detail Scraper ──────────────────────────────────────
  console.log('\n📄 TEST 2: Detail page (first listing only)...');
  const detailScraper = new EwdifahDetailScraper();
  const firstJob = listings[0];
  const bodyText = await detailScraper.fetchBodyText(firstJob.jobUrl);

  console.log(`   ✅ Body text length: ${bodyText.length} chars`);
  console.log(`   First 300 chars:\n   "${bodyText.substring(0, 300)}..."`);

  if (!bodyText) {
    console.error('   ❌ Empty body text! Check the .card-body selector.');
    return;
  }

  // ─── TEST 3: LLM Enrichment ──────────────────────────────────────
  console.log('\n🤖 TEST 3: LLM enrichment...');
  const enrichmentService = new JobEnrichmentService();
  const result = await enrichmentService.enrich(bodyText, firstJob.jobUrl);

  console.log(`   ✅ LLM extracted ${result.jobs.length} job(s)`);
  console.log('   Jobs:');
  result.jobs.forEach((job, i) => {
    console.log(`   [${i + 1}] title:       ${job.title}`);
    console.log(`        companyName: ${job.companyName}`);
    console.log(`        location:    ${job.location}`);
    console.log(`        category:    ${job.category}`);
    console.log(`        hrEmail:     ${job.hrEmail}`);
    console.log(`        postedAt:    ${job.postedAt}`);
    console.log(`        expiresAt:   ${job.expiresAt}`);
    console.log('');
  });

  console.log('========================================');
  console.log('✅ SMOKE TEST PASSED');
  console.log('========================================\n');
}

smokeTest().catch((err) => {
  console.error('\n❌ SMOKE TEST FAILED:', err.message);
  console.error(err.stack);
  process.exit(1);
});
