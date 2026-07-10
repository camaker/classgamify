import { ACTIVITY_TEMPLATE_TYPES } from '@/activities/types';
import { WORKSHEET_MODE_TEMPLATES } from '@/activities/worksheet-modes';
import { Routes } from '@/lib/routes';

export const TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS = [
  'product-roadmap-boundary',
  'current-loop-signal',
  'wordwall-template-set',
  'liveworksheets-mode-set',
  'public-template-entry',
  'public-worksheet-entry',
  'shared-create-editor',
  'template-scaffold-coverage',
  'create-input-contract',
  'template-readiness-diagnosis',
  'deterministic-remix-foundation',
  'quiz-choice-generation',
  'ai-draft-capability',
  'ai-remix-assist',
  'source-extraction-readiness',
  'teacher-audio-path',
  'worksheet-extraction-path',
  'spreadsheet-import-path',
  'assignment-snapshot-extension',
  'student-runtime-routing',
  'fill-blank-runtime',
  'line-match-runtime',
  'group-sort-runtime',
  'matching-pairs-runtime',
  'listening-runtime',
  'open-box-runtime',
  'printable-follow-up',
  'result-export-continuity',
  'privacy-model-guard',
  'template-roadmap-chain-gate',
] as const;

export const TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/pages/public-page-view.ts',
  'src/routes/(pages)/roadmap.tsx',
  'src/routes/templates.tsx',
  'src/routes/worksheets.tsx',
  'src/activities/catalog.ts',
  'src/activities/types.ts',
  'src/activities/scaffolds.ts',
  'src/activities/worksheet-modes.ts',
  'src/activities/template-entry.ts',
  'src/activities/entry-page-view.ts',
  'src/activities/template-remix.ts',
  'src/activities/ai-remix-assist.ts',
  'src/activities/distractors.ts',
  'src/activities/source-extraction-assist.ts',
  'src/activities/ai-authoring-chain.ts',
  'src/activities/authoring-library-chain.ts',
  'src/assignments/worksheet-mode-delivery-chain.ts',
  'src/assignments/student-runner-play-chain.ts',
  'src/assignments/fill-blank-worksheet-handoff.ts',
  'src/assignments/line-match-board-handoff.ts',
  'src/assignments/group-sort-board-handoff.ts',
  'src/assignments/matching-pairs-board-handoff.ts',
  'src/assignments/listening-speech-handoff.ts',
  'src/assignments/open-box-reveal-handoff.ts',
  'src/assignments/printable-worksheet-view.ts',
  'src/assignments/results-export.ts',
  'src/components/activities/activity-template-readiness-panel.tsx',
  'src/seo/public-discovery-indexing-chain.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type TemplateRoadmapCapabilityChainHandoffItemId =
  (typeof TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type TemplateRoadmapCapabilityChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: TemplateRoadmapCapabilityChainHandoffItemId;
  label: string;
  value: string;
};

export type TemplateRoadmapCapabilityChainPrivacyContract = {
  chainSourceFileCount: number;
  createsAssignmentLinksWithoutTeacherAction: false;
  createsParallelWorksheetModel: false;
  exposesAnswerKeysToPublicPayload: false;
  exposesPromptTextInHandoff: false;
  exposesRawAiOutput: false;
  exposesRawSourceText: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  itemIds: TemplateRoadmapCapabilityChainHandoffItemId[];
  mutatesExistingAssignmentSnapshots: false;
  readsSourceMaterialFileBytes: false;
  requiresCreateActivityInputContract: true;
  requiresTeacherReviewBeforePersistence: true;
  sourceFiles: string[];
  usesSharedActivityAssignmentModel: true;
};

export type TemplateRoadmapCapabilityChainHandoffView = {
  description: string;
  itemViews: TemplateRoadmapCapabilityChainHandoffItemView[];
  privacy: TemplateRoadmapCapabilityChainPrivacyContract;
  title: string;
};

export function buildTemplateRoadmapCapabilityChainHandoffView(): TemplateRoadmapCapabilityChainHandoffView {
  const itemViews = TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildTemplateRoadmapCapabilityChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice template roadmap capability chain from public roadmap promises through Wordwall-style templates, Liveworksheets-style modes, shared editor scaffolds, teacher-reviewed AI enhancements, worksheet delivery, print follow-up, and result export continuity.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES.length,
      createsAssignmentLinksWithoutTeacherAction: false,
      createsParallelWorksheetModel: false,
      exposesAnswerKeysToPublicPayload: false,
      exposesPromptTextInHandoff: false,
      exposesRawAiOutput: false,
      exposesRawSourceText: false,
      exposesSourceMaterialFileIds: false,
      exposesSourceMaterialStorageKeys: false,
      itemIds: [...TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS],
      mutatesExistingAssignmentSnapshots: false,
      readsSourceMaterialFileBytes: false,
      requiresCreateActivityInputContract: true,
      requiresTeacherReviewBeforePersistence: true,
      sourceFiles: [...TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES],
      usesSharedActivityAssignmentModel: true,
    },
    title: 'Template roadmap capability chain',
  };
}

function buildTemplateRoadmapCapabilityChainHandoffItemView(
  id: TemplateRoadmapCapabilityChainHandoffItemId
): TemplateRoadmapCapabilityChainHandoffItemView {
  const item = getTemplateRoadmapCapabilityChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getTemplateRoadmapCapabilityChainHandoffItem(
  id: TemplateRoadmapCapabilityChainHandoffItemId
): Omit<TemplateRoadmapCapabilityChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-roadmap-boundary':
      return item(
        id,
        'Product roadmap boundary',
        Routes.Roadmap,
        'The public roadmap describes available and near-term ClassGamify classroom capabilities without promising a parallel product.'
      );
    case 'current-loop-signal':
      return item(
        id,
        'Current loop signal',
        'Create -> publish -> play -> results',
        'Roadmap copy keeps the current usable activity, assignment, runner, and result-review loop visible.'
      );
    case 'wordwall-template-set':
      return item(
        id,
        'Wordwall template set',
        `${ACTIVITY_TEMPLATE_TYPES.length} template modes`,
        'Wordwall-style templates stay in the shared ActivityTemplateType catalog.'
      );
    case 'liveworksheets-mode-set':
      return item(
        id,
        'Liveworksheets mode set',
        `${WORKSHEET_MODE_TEMPLATES.length} worksheet modes`,
        'Worksheet-style modes are a subset of the same activity template catalog.'
      );
    case 'public-template-entry':
      return item(
        id,
        'Public template entry',
        Routes.Templates,
        'Template cards start teachers in the shared create editor with the selected primary template.'
      );
    case 'public-worksheet-entry':
      return item(
        id,
        'Public worksheet entry',
        Routes.Worksheets,
        'Worksheet entry cards route into the shared editor with source=worksheets.'
      );
    case 'shared-create-editor':
      return item(
        id,
        'Shared create editor',
        Routes.Create,
        'Templates, worksheets, scaffolds, and AI drafts all land in the same teacher-reviewed editor.'
      );
    case 'template-scaffold-coverage':
      return item(
        id,
        'Template scaffold coverage',
        'All template scaffolds',
        'Each template has a reviewed scaffold that demonstrates reusable questions, pairs, groups, vocabulary, and notes where possible.'
      );
    case 'create-input-contract':
      return item(
        id,
        'Create input contract',
        'CreateActivityInput',
        'Manual edits, scaffolds, AI drafts, and extraction assists target the same validated activity input shape.'
      );
    case 'template-readiness-diagnosis':
      return item(
        id,
        'Template readiness diagnosis',
        'Ready and locked modes',
        'Editor, library, AI draft metadata, and remix surfaces share deterministic ready/locked template diagnostics.'
      );
    case 'deterministic-remix-foundation':
      return item(
        id,
        'Deterministic remix foundation',
        'Ready targets first',
        'Template remixing starts with deterministic readiness and draft copies before any AI completion path.'
      );
    case 'quiz-choice-generation':
      return item(
        id,
        'Quiz choice generation',
        'ActivityQuestion.options',
        'Deterministic and future AI distractors write into ActivityQuestion.options without changing student submissions.'
      );
    case 'ai-draft-capability':
      return item(
        id,
        'AI draft capability',
        'Teacher-reviewed draft',
        'AI authoring fills CreateActivityInput for teacher review and cannot persist or publish directly.'
      );
    case 'ai-remix-assist':
      return item(
        id,
        'AI remix assist',
        'Missing-field completion',
        'AI remix assist may complete missing structured fields before save while preserving editor review.'
      );
    case 'source-extraction-readiness':
      return item(
        id,
        'Source extraction readiness',
        'Future extraction paths',
        'Source extraction assist exposes audio, worksheet, and spreadsheet readiness without claiming extraction has run.'
      );
    case 'teacher-audio-path':
      return item(
        id,
        'Teacher audio path',
        'Listening draft readiness',
        'Teacher audio upload supports future listening draft input while file bytes remain outside AI handoffs.'
      );
    case 'worksheet-extraction-path':
      return item(
        id,
        'Worksheet extraction path',
        'Worksheet import readiness',
        'Worksheet image and document extraction targets ActivityContent through teacher-reviewed editor steps.'
      );
    case 'spreadsheet-import-path':
      return item(
        id,
        'Spreadsheet import path',
        'Structured import readiness',
        'Spreadsheet source materials can signal future structured import paths without creating a parallel schema.'
      );
    case 'assignment-snapshot-extension':
      return item(
        id,
        'Assignment snapshot extension',
        'AssignmentSnapshot',
        'Worksheet delivery, print, and result exports extend frozen assignment snapshots instead of mutating activities.'
      );
    case 'student-runtime-routing':
      return item(
        id,
        'Student runtime routing',
        'Runtime item kind',
        'Student runner routing uses template type and runtime item kind while keeping the shared answer contract.'
      );
    case 'fill-blank-runtime':
      return item(
        id,
        'Fill-blank runtime',
        'Inline blanks',
        'Fill-blank supports worksheet-style inline answers on the shared runtime and scoring model.'
      );
    case 'line-match-runtime':
      return item(
        id,
        'Line-match runtime',
        'Connection board',
        'Line-match renders pair content as a connection flow without exposing answer maps.'
      );
    case 'group-sort-runtime':
      return item(
        id,
        'Group-sort runtime',
        'Category board',
        'Group-sort preserves classification interactions on the shared runtime item contract.'
      );
    case 'matching-pairs-runtime':
      return item(
        id,
        'Matching-pairs runtime',
        'Left/right cards',
        'Matching-pairs uses a card board while staying on the same pair-answer contract.'
      );
    case 'listening-runtime':
      return item(
        id,
        'Listening runtime',
        'Speech track',
        'Listening hides transcript details until review and keeps speech language tied to activity content.'
      );
    case 'open-box-runtime':
      return item(
        id,
        'Open-box runtime',
        'Reveal flow',
        'Open-box adds a reveal-card classroom mode without changing the persisted answer shape.'
      );
    case 'printable-follow-up':
      return item(
        id,
        'Printable follow-up',
        'Teacher print route',
        'Printable handouts derive from frozen snapshots and keep answer keys teacher-only.'
      );
    case 'result-export-continuity':
      return item(
        id,
        'Result export continuity',
        'Shared result export',
        'Worksheet and template attempts keep the same result-export preparation and delivery-policy formatting.'
      );
    case 'privacy-model-guard':
      return item(
        id,
        'Privacy model guard',
        'No parallel model',
        'The template roadmap avoids parallel worksheet models, direct AI persistence, raw source text, storage keys, and public answer keys.'
      );
    case 'template-roadmap-chain-gate':
      return item(
        id,
        'Template roadmap chain gate',
        '30 source files',
        'A focused gate keeps roadmap copy, template entries, editor scaffolds, AI enhancements, runtimes, print, and exports aligned.'
      );
  }
}

function item(
  id: TemplateRoadmapCapabilityChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<TemplateRoadmapCapabilityChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
