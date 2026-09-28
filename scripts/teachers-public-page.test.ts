import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const TEACHERS_ROUTE_SOURCE = readFileSync(
  'src/routes/(pages)/teachers.tsx',
  'utf8'
);

test('teachers route keeps internal handoff out of public DOM', () => {
  assert.doesNotMatch(
    TEACHERS_ROUTE_SOURCE,
    /TeachersPageHandoffPanel|data-handoff|data-handoff-item|pageView\.handoffView/,
    'Teachers route must not render internal handoff markup on the public page.'
  );
  assert.doesNotMatch(
    TEACHERS_ROUTE_SOURCE,
    /teachers-page-product-loop/,
    'Teachers route must keep the internal handoff scope out of public source.'
  );
});
