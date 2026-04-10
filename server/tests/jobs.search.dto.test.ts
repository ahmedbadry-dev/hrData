import assert from 'node:assert/strict';
import test from 'node:test';

import { SearchJobsDtoSchema } from '../src/v1/modules/jobs/dto/search-jobs.dto';

test('search jobs DTO accepts empty query object for unfiltered search', () => {
  const parsed = SearchJobsDtoSchema.parse({ query: {} });

  assert.deepEqual(parsed.query, {
    page: 1,
    limit: 20,
  });
});

test('search jobs DTO transforms isExpired string into boolean', () => {
  const parsed = SearchJobsDtoSchema.parse({
    query: {
      isExpired: 'true',
    },
  });

  assert.equal(parsed.query.isExpired, true);
});
