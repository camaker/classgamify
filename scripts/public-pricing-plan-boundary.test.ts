import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRICING_ROUTE_SOURCE = readFileSync(
  'src/routes/(pages)/pricing.tsx',
  'utf8'
);

test('public pricing route keeps internal handoff out of public DOM', () => {
  assert.doesNotMatch(
    PRICING_ROUTE_SOURCE,
    /PricingPageHandoffPanel|data-handoff|data-handoff-item|pageView\.handoffView/,
    'Pricing route must not render internal handoff markup on the public page.'
  );
  assert.doesNotMatch(
    PRICING_ROUTE_SOURCE,
    /public-pricing-plan-boundary/,
    'Pricing route must keep the internal handoff scope out of public source.'
  );
});
