import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldLoadAnalytics } from '../src/lib/analytics-host';
import { ClarityAnalytics } from '../src/components/analytics/clarity-analytics';

test('production analytics excludes local, previews, automation and lookalike hosts', () => {
  const prod = { prod: true, mode: 'production' };
  assert.equal(
    shouldLoadAnalytics({ ...prod, hostname: 'classgamify.com' }),
    true
  );
  assert.equal(
    shouldLoadAnalytics({ ...prod, hostname: 'www.classgamify.com' }),
    true
  );
  for (const hostname of [
    'localhost',
    '127.0.0.1',
    'classgamify.workers.dev',
    'classgamify.com.example.test',
    undefined,
  ]) {
    assert.equal(shouldLoadAnalytics({ ...prod, hostname }), false);
  }
  assert.equal(
    shouldLoadAnalytics({ ...prod, hostname: 'classgamify.com', mode: 'e2e' }),
    false
  );
  assert.equal(
    shouldLoadAnalytics({
      ...prod,
      hostname: 'classgamify.com',
      webdriver: true,
    }),
    false
  );
});

test('replay stays off on this student-facing product', () => {
  assert.equal(ClarityAnalytics(), null);
});
