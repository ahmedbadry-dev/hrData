import assert from 'node:assert/strict';
import test from 'node:test';

import { GetDailyStatsDtoSchema } from '../src/v1/modules/analytics/dto/get-daily-stats.dto';

test('get daily stats dto applies default days value', () => {
  const parsed = GetDailyStatsDtoSchema.parse({ query: {} });
  assert.equal(parsed.query.days, 7);
});

test('get daily stats dto coerces valid days values', () => {
  const parsed = GetDailyStatsDtoSchema.parse({ query: { days: '30' } });
  assert.equal(parsed.query.days, 30);
});

test('get daily stats dto rejects out-of-range and non-integer values', () => {
  assert.throws(() => GetDailyStatsDtoSchema.parse({ query: { days: 0 } }));
  assert.throws(() => GetDailyStatsDtoSchema.parse({ query: { days: 91 } }));
  assert.throws(() => GetDailyStatsDtoSchema.parse({ query: { days: 7.5 } }));
});
