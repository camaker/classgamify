import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const ROOT_ROUTE_SOURCE = readFileSync('src/routes/__root.tsx', 'utf8');

test('root document mounts no global handoff markup', () => {
  assert.doesNotMatch(
    ROOT_ROUTE_SOURCE,
    /Handoff\b|data-handoff|data-handoff-item/,
    'The root document renders on every public page, so it must not mount handoff audit markup.'
  );
});

test('public DOM handoff boundary focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Public DOM handoff boundary has a fast script-level gate via[\s\S]*scripts\/public-dom-boundary\.test\.ts/,
    'TEST-CATALOG should document the public DOM handoff boundary gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /marketing[\s\S]*editorial[\s\S]*legal[\s\S]*contact[\s\S]*auth[\s\S]*shared public components[\s\S]*data-handoff/,
    'TEST-CATALOG should document which public surfaces must keep internal audit DOM out.'
  );
});
