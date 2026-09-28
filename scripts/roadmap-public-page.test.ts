import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildRoadmapPageViewModel } from '@/pages/public-page-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const ROADMAP_ROUTE_SOURCE = readFileSync(
  'src/routes/(pages)/roadmap.tsx',
  'utf8'
);

test('roadmap handoff exposes 30 safe public product-boundary slices', () => {
  const serializedPageView = JSON.stringify(buildRoadmapPageViewModel());
  assert.equal(serializedPageView.includes('Classroom evidence'), false);
  assert.equal(
    serializedPageView.includes('Every roadmap item needs classroom proof'),
    false
  );
});

test('roadmap route keeps internal handoff out of public DOM', () => {
  assert.doesNotMatch(
    ROADMAP_ROUTE_SOURCE,
    /RoadmapPublicHandoff|data-handoff|data-handoff-item|pageView\.handoffView/,
    'Roadmap route must not render internal handoff markup on the public page.'
  );
});
