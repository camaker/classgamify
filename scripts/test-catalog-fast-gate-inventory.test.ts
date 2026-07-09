import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const TEST_CATALOG_PATH = 'tests/e2e/TEST-CATALOG.md';
const SCRIPT_TEST_PATH_PATTERN = /scripts\/[A-Za-z0-9._/-]+\.test\.ts/g;

const catalogSource = readFileSync(TEST_CATALOG_PATH, 'utf8');
const catalogScriptRefs = new Set(
  [...catalogSource.matchAll(SCRIPT_TEST_PATH_PATTERN)].map((match) => match[0])
);
const localScriptTests = readdirSync('scripts')
  .filter((fileName) => fileName.endsWith('.test.ts'))
  .map((fileName) => `scripts/${fileName}`)
  .sort();

test('TEST-CATALOG fast-gate script references resolve to local tests', () => {
  const missingScriptRefs = [...catalogScriptRefs]
    .filter((scriptPath) => !existsSync(scriptPath))
    .sort();

  assert.deepEqual(
    missingScriptRefs,
    [],
    'Every fast-gate script path listed in TEST-CATALOG should exist.'
  );
});

test('every local script-level product gate is discoverable from TEST-CATALOG', () => {
  const unlistedScriptTests = localScriptTests.filter(
    (scriptPath) => !catalogScriptRefs.has(scriptPath)
  );

  assert.deepEqual(
    unlistedScriptTests,
    [],
    'Each scripts/*.test.ts gate should be discoverable from TEST-CATALOG.'
  );
});

test('fast-gate inventory check is documented for future catalog edits', () => {
  assert.match(
    catalogSource,
    /Fast-gate inventory has a script-level gate via[\s\S]*scripts\/test-catalog-fast-gate-inventory\.test\.ts/,
    'TEST-CATALOG should document the fast-gate inventory test.'
  );
  assert.match(
    catalogSource,
    /TEST-CATALOG script references[\s\S]*local\s+product-gate scripts/,
    'TEST-CATALOG should document when to run the inventory check.'
  );
});
