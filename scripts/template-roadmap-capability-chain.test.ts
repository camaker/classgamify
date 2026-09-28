import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { ACTIVITY_TEMPLATE_TYPES } from '@/activities/types';
import { WORKSHEET_MODE_TEMPLATES } from '@/activities/worksheet-modes';
import { DEFAULT_QUESTION_CHOICE_COUNT } from '@/activities/distractors';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const PUBLIC_PAGE_VIEW_SOURCE = readFileSync(
  'src/pages/public-page-view.ts',
  'utf8'
);
const TEMPLATE_ENTRY_SOURCE = readFileSync(
  'src/activities/template-entry.ts',
  'utf8'
);
const ENTRY_PAGE_SOURCE = readFileSync(
  'src/activities/entry-page-view.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('template roadmap capability chain is backed by focused gates', () => {
  assert.deepEqual(ACTIVITY_TEMPLATE_TYPES, [
    'quiz',
    'match-up',
    'line-match',
    'group-sort',
    'fill-blank',
    'listening',
    'matching-pairs',
    'open-box',
  ]);
  assert.deepEqual(
    [...WORKSHEET_MODE_TEMPLATES],
    ['fill-blank', 'line-match', 'listening', 'group-sort']
  );
  assert.equal(DEFAULT_QUESTION_CHOICE_COUNT, 4);
});

test('template roadmap capability chain preserves product roadmap boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /## Near-Term Template Roadmap[\s\S]*Wordwall-style: quiz, match-up, group sort, matching pairs, open box\./,
    'docs/product.md should keep the Wordwall-style template roadmap explicit.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Liveworksheets-style: fill blanks, worksheet layout, first listening prompts,[\s\S]*while preserving the activity-assignment\s+data model/,
    'docs/product.md should keep worksheet modes inside the shared activity-assignment data model.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /AI enhancements: source-to-activity drafts, template transforms, distractor\s+generation, leveled variants, answer explanations, listening scripts, and\s+worksheet extraction from teacher-uploaded material\./,
    'docs/product.md should keep AI enhancements teacher-reviewable and template-oriented.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /The AI layer must not bypass the activity editor or persist content directly/,
    'AI authoring should remain editor-reviewed rather than direct persistence.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Printable follow-up and teacher-uploaded worksheet\s+extraction should extend the same assignment snapshot[\s\S]*result-export model instead of creating a parallel worksheet data shape\./,
    'Worksheet roadmap work should extend snapshots and result exports without a parallel model.'
  );
});

test('template roadmap capability sources align entries, status, and review gates', () => {
  assert.match(
    PUBLIC_PAGE_VIEW_SOURCE,
    /id: 'ai-assisted-activity-drafting'[\s\S]*status: 'available'/,
    'Roadmap should mark AI-assisted activity drafting as available.'
  );
  assert.match(
    PUBLIC_PAGE_VIEW_SOURCE,
    /id: 'worksheet-style-delivery'[\s\S]*status: 'improving'/,
    'Roadmap should mark worksheet-style delivery as improving.'
  );
  assert.match(
    PUBLIC_PAGE_VIEW_SOURCE,
    /id: 'worksheet-extraction'[\s\S]*status: 'planned'/,
    'Roadmap should keep worksheet extraction as planned future work.'
  );
  assert.match(
    TEMPLATE_ENTRY_SOURCE,
    /buildTemplateEntryAction[\s\S]*search: buildTemplateCreateSearch\(template\.type, 'templates'\)[\s\S]*to: Routes\.Create/,
    'Template entry actions should route into the shared create editor.'
  );
  assert.match(
    TEMPLATE_ENTRY_SOURCE,
    /buildWorksheetModeEntryAction[\s\S]*search: buildTemplateCreateSearch\(mode\.template, 'worksheets'\)[\s\S]*to: Routes\.Create/,
    'Worksheet entry actions should route into the shared create editor.'
  );
  assert.match(
    ENTRY_PAGE_SOURCE,
    /buildWorksheetsPageViewModel[\s\S]*modeCards: worksheetModeDefinitions\.map/,
    'Worksheet page view model should use shared mode cards.'
  );
});

test('template roadmap capability chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Template roadmap capability chain has a fast script-level gate via[\s\S]*scripts\/template-roadmap-capability-chain\.test\.ts/,
    'TEST-CATALOG should document the template roadmap capability chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /roadmap template promises[\s\S]*Wordwall-style templates[\s\S]*Liveworksheets-style modes[\s\S]*AI enhancements[\s\S]*worksheet delivery[\s\S]*print follow-up[\s\S]*result\s+export\s+continuity/,
    'TEST-CATALOG should describe the full template roadmap capability chain scope.'
  );
});
