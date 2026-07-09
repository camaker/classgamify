import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const SOURCE_ROOT = 'src';
const SCRIPT_ROOT = 'scripts';
const TEST_CATALOG_PATH = 'tests/e2e/TEST-CATALOG.md';
const EXPECTED_HANDOFF_ITEM_COUNT = 30;
const HANDOFF_ARRAY_PATTERN =
  /export const ([A-Z0-9_]+HANDOFF_ITEM_IDS)\s*=\s*\[([\s\S]*?)\]\s*(?:as const)?/g;
const STRING_LITERAL_PATTERN = /'([^']+)'/g;
const HANDOFF_ITEM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type HandoffInventoryEntry = {
  constName: string;
  filePath: string;
  itemIds: string[];
};

const inventoryEntries = discoverHandoffInventory();
const scriptGateSources = readScriptGateSources();
const testCatalogSource = readFileSync(TEST_CATALOG_PATH, 'utf8');

test('handoff inventory discovers product-loop contracts', () => {
  const discoveredNames = new Set(
    inventoryEntries.map((entry) => entry.constName)
  );

  for (const requiredName of [
    'ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS',
    'ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS',
    'STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS',
    'ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS',
    'PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS',
    'CLASSROOM_CONTROL_SEMANTICS_HANDOFF_ITEM_IDS',
  ]) {
    assert.ok(
      discoveredNames.has(requiredName),
      `Missing expected handoff inventory entry ${requiredName}.`
    );
  }

  assert.ok(
    inventoryEntries.length >= 70,
    'Handoff inventory should cover the current classroom product-loop surface.'
  );
});

test('every handoff item contract exposes exactly 30 slices', () => {
  const wrongSizedContracts = inventoryEntries
    .filter((entry) => entry.itemIds.length !== EXPECTED_HANDOFF_ITEM_COUNT)
    .map(
      (entry) =>
        `${entry.filePath}:${entry.constName} has ${entry.itemIds.length} items`
    );

  assert.deepEqual(
    wrongSizedContracts,
    [],
    'Each exported *_HANDOFF_ITEM_IDS contract should keep 30 verifiable slices.'
  );
});

test('handoff item ids stay unique inside each contract', () => {
  const duplicateReports = inventoryEntries.flatMap((entry) =>
    findDuplicateValues(entry.itemIds).map(
      (itemId) => `${entry.filePath}:${entry.constName} duplicates ${itemId}`
    )
  );

  assert.deepEqual(
    duplicateReports,
    [],
    'Handoff item ids should not repeat inside a single contract.'
  );
});

test('handoff item ids remain stable kebab-case semantic slices', () => {
  const invalidItemIds = inventoryEntries.flatMap((entry) =>
    entry.itemIds
      .filter((itemId) => !HANDOFF_ITEM_ID_PATTERN.test(itemId))
      .map((itemId) => `${entry.filePath}:${entry.constName} -> ${itemId}`)
  );

  assert.deepEqual(
    invalidItemIds,
    [],
    'Handoff item ids should use stable kebab-case semantic ids.'
  );
});

test('every handoff item contract is covered by a focused script gate', () => {
  const untestedContracts = inventoryEntries
    .filter(
      (entry) =>
        !scriptGateSources.some((scriptSource) =>
          scriptSource.source.includes(entry.constName)
        )
    )
    .map((entry) => `${entry.filePath}:${entry.constName}`);

  assert.deepEqual(
    untestedContracts,
    [],
    'Each exported *_HANDOFF_ITEM_IDS contract should be referenced by a focused script-level gate.'
  );
});

test('handoff inventory check is documented for future contract edits', () => {
  assert.match(
    testCatalogSource,
    /Handoff item inventory has a script-level gate via[\s\S]*scripts\/handoff-item-inventory\.test\.ts/,
    'TEST-CATALOG should document the handoff item inventory gate.'
  );
  assert.match(
    testCatalogSource,
    /30-item handoff arrays[\s\S]*unique kebab-case item ids/,
    'TEST-CATALOG should document the handoff inventory trigger scope.'
  );
  assert.match(
    testCatalogSource,
    /focused\s+script-level coverage/,
    'TEST-CATALOG should document the focused gate coverage boundary.'
  );
});

function discoverHandoffInventory(): HandoffInventoryEntry[] {
  return listSourceFiles(SOURCE_ROOT)
    .flatMap((filePath) => parseHandoffInventoryEntries(filePath))
    .sort((left, right) =>
      `${left.filePath}:${left.constName}`.localeCompare(
        `${right.filePath}:${right.constName}`
      )
    );
}

function listSourceFiles(directoryPath: string): string[] {
  return readdirSync(directoryPath)
    .flatMap((entryName) => {
      const entryPath = join(directoryPath, entryName);
      const entryStats = statSync(entryPath);

      if (entryStats.isDirectory()) {
        return listSourceFiles(entryPath);
      }

      if (entryStats.isFile() && /\.(ts|tsx)$/.test(entryName)) {
        return [entryPath.replace(/\\/g, '/')];
      }

      return [];
    })
    .sort();
}

function readScriptGateSources() {
  return readdirSync(SCRIPT_ROOT)
    .filter((fileName) => fileName.endsWith('.test.ts'))
    .map((fileName) => {
      const filePath = `${SCRIPT_ROOT}/${fileName}`;

      return {
        filePath,
        source: readFileSync(filePath, 'utf8'),
      };
    })
    .sort((left, right) => left.filePath.localeCompare(right.filePath));
}

function parseHandoffInventoryEntries(
  filePath: string
): HandoffInventoryEntry[] {
  const source = readFileSync(filePath, 'utf8');
  const entries: HandoffInventoryEntry[] = [];

  for (const match of source.matchAll(HANDOFF_ARRAY_PATTERN)) {
    const [, constName, arrayBody] = match;
    const itemIds = [...arrayBody.matchAll(STRING_LITERAL_PATTERN)].map(
      (itemMatch) => itemMatch[1]
    );

    entries.push({
      constName,
      filePath,
      itemIds,
    });
  }

  return entries;
}

function findDuplicateValues(values: string[]): string[] {
  const seenValues = new Set<string>();
  const duplicateValues = new Set<string>();

  for (const value of values) {
    if (seenValues.has(value)) {
      duplicateValues.add(value);
    }
    seenValues.add(value);
  }

  return [...duplicateValues].sort();
}
