import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { getRuntimeItems, type RuntimeItem } from '@/activities/runtime';
import type { ActivityContent } from '@/activities/types';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import { buildPublicAssignmentPayload } from '@/assignments/public';
import { buildPrintableAssignmentWorksheet } from '@/assignments/printable-worksheet';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_ORDER_ANSWER_SHOULD_NOT_LEAK';
const SECRET_CHOICE = 'SECRET_ORDER_CHOICE_SHOULD_NOT_LEAK';
const SECRET_PROMPT = 'SECRET_ORDER_PROMPT_SHOULD_NOT_LEAK';
const SECRET_SOURCE_MATERIAL = 'SECRET_SOURCE_MATERIAL_SHOULD_NOT_LEAK';

const ITEM_ORDER_SOURCE = readProjectFile('src/assignments/item-order.ts');
const TEST_CATALOG_SOURCE = readProjectFile('tests/e2e/TEST-CATALOG.md');
const apiSource = readProjectFile('src/api/assignments.ts');
const deliverySummarySource = readProjectFile(
  'src/assignments/delivery-summary.ts'
);
const printableSource = readProjectFile(
  'src/assignments/printable-worksheet.ts'
);
const publicSource = readProjectFile('src/assignments/public.ts');
const publishSource = readProjectFile('src/assignments/publish-input.ts');
const resultsExportSource = readProjectFile(
  'src/assignments/results-export.ts'
);
const studentRunnerSource = readProjectFile(
  'src/assignments/student-runner-state.ts'
);

const activityContent: ActivityContent = {
  difficulty: 'starter',
  gradeBand: 'Grade 4',
  groups: [],
  language: 'en',
  learningGoal: 'Students verify stable assignment item ordering.',
  pairs: [],
  questions: [
    buildQuestion('alpha'),
    buildQuestion('bravo'),
    buildQuestion('charlie'),
    buildQuestion('delta'),
    buildQuestion('echo'),
  ],
  sourceMaterials: [
    {
      fileId: SECRET_SOURCE_MATERIAL,
      kind: 'worksheet-document',
      originalName: 'Private worksheet.pdf',
    },
  ],
  sourceSummary: 'Private source summary stays out of ordering handoffs.',
  subject: 'Science',
  teacherNotes: ['Private teacher note stays out of ordering handoffs.'],
  vocabulary: ['alpha', 'bravo', 'charlie', 'delta', 'echo'],
};

test('assignment item order stays aligned across public payload and printable worksheet', () => {
  const runtimeItems = getRuntimeItems('quiz', activityContent);
  const shuffledOnce = orderAssignmentRuntimeItems({
    items: runtimeItems,
    shareSlug: 'class-a-share',
    shuffleItems: true,
  });
  const publicPayload = buildPublicAssignmentPayload({
    activity: {
      contentJson: activityContent,
      description: 'Ordering activity',
      id: 'activity-order',
      templateType: 'quiz',
      title: 'Ordering activity',
      visibility: 'draft',
    },
    assignment: {
      expiresAt: null,
      id: 'assignment-order',
      settingsJson: {
        shuffleItems: true,
      },
      shareSlug: 'class-a-share',
      status: 'published',
      title: 'Ordering assignment',
    },
  });
  const printableWorksheet = buildPrintableAssignmentWorksheet({
    activity: {
      description: 'Ordering activity',
      templateType: 'quiz',
      title: 'Ordering activity',
    },
    assignment: {
      expiresAt: null,
      settingsJson: {
        shuffleItems: true,
      },
      shareSlug: 'class-a-share',
      title: 'Ordering assignment',
    },
    runtimeItems,
  });
  const shuffledIds = getRuntimeItemIds(shuffledOnce);

  assert.deepEqual(
    publicPayload.runtimeItems.map((item) => item.id),
    shuffledIds
  );
  assert.deepEqual(
    printableWorksheet.items.map((item) => item.id),
    shuffledIds
  );
  assert.deepEqual(
    printableWorksheet.items.map((item) => item.sequenceNumber),
    [1, 2, 3, 4, 5]
  );
});

test('assignment item order helper preserves stable normalized delivery order', () => {
  const runtimeItems = getRuntimeItems('quiz', activityContent);
  const snapshotIds = getRuntimeItemIds(runtimeItems);
  const shuffledFromTrimmedSeed = orderAssignmentRuntimeItems({
    items: runtimeItems,
    shareSlug: ' class-a-share ',
    shuffleItems: true,
  });
  const shuffledFromNormalizedSeed = orderAssignmentRuntimeItems({
    items: runtimeItems,
    shareSlug: ' ｃｌａｓｓ-a-share ',
    shuffleItems: true,
  });
  const shuffledFromAlternateSeed = orderAssignmentRuntimeItems({
    items: runtimeItems,
    shareSlug: 'class-a-share-2',
    shuffleItems: true,
  });
  const fixedOrder = orderAssignmentRuntimeItems({
    items: runtimeItems,
    shareSlug: 'class-a-share',
    shuffleItems: false,
  });

  assert.deepEqual(
    getRuntimeItemIds(shuffledFromTrimmedSeed),
    getRuntimeItemIds(shuffledFromNormalizedSeed)
  );
  assert.notDeepEqual(
    getRuntimeItemIds(shuffledFromTrimmedSeed),
    getRuntimeItemIds(shuffledFromAlternateSeed)
  );
  assert.deepEqual(getRuntimeItemIds(fixedOrder), snapshotIds);
  assert.notEqual(fixedOrder, runtimeItems);
  assert.deepEqual(getRuntimeItemIds(runtimeItems), snapshotIds);
});

test('assignment item order focused gate and helper source stay documented', () => {
  assert.match(
    ITEM_ORDER_SOURCE,
    /export function orderAssignmentRuntimeItems[\s\S]*stableShuffle\(items, normalizeAssignmentShareSlug\(shareSlug\)\)[\s\S]*: \[\.\.\.items\]/,
    'Assignment item ordering should seed shuffle through normalized share slugs and preserve fixed snapshot order through a copied array.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/assignment-item-order\.test\.ts/,
    'E2E catalog should point item-order work at the focused script gate.'
  );
  for (const boundary of [
    'share-slug normalization',
    'public payload ordering',
    'student submit/review ordering',
    'printable worksheet ordering',
  ]) {
    assert.match(
      TEST_CATALOG_SOURCE,
      new RegExp(boundary.replace('/', '\\/').replace(/\s+/g, '\\s+')),
      `E2E catalog should mention item-order boundary: ${boundary}`
    );
  }
});

function buildQuestion(id: string) {
  return {
    answer: `${SECRET_ANSWER}-${id}`,
    explanation: `Explanation for ${id}`,
    id: `item-${id}`,
    options: [
      {
        id: `answer-${id}`,
        text: `${SECRET_ANSWER}-${id}`,
      },
      {
        id: `choice-${id}`,
        text: `${SECRET_CHOICE}-${id}`,
      },
    ],
    prompt: `${SECRET_PROMPT}-${id}`,
  };
}

function readProjectFile(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function getRuntimeItemIds(items: Array<Pick<RuntimeItem, 'id'>>) {
  return items.map((item) => item.id);
}

test('assignment item order source boundaries stay wired to shared helpers', () => {
  assert.match(
    deliverySummarySource,
    /id: 'itemOrder'[\s\S]*formatShuffleItems\(shuffleItems\)/,
    'deliverySummaryExposesPolicy'
  );
  assert.match(
    apiSource,
    /assertSubmittedAnswersMatchRuntimeItems\(\{[\s\S]*runtimeItems: orderedRuntimeItems/,
    'orderedAnswerContractUsesRuntimeItems'
  );
  assert.match(
    printableSource,
    /buildPrintableAssignmentWorksheet[\s\S]*const orderedRuntimeItems = orderAssignmentRuntimeItems\(\{[\s\S]*items: runtimeItems,[\s\S]*shareSlug,[\s\S]*shuffleItems: settings\.shuffleItems/,
    'printableWorksheetUsesOrdering'
  );
  assert.match(
    publicSource,
    /buildPublicAssignmentPayload[\s\S]*const orderedRuntimeItems = orderAssignmentRuntimeItems\(\{[\s\S]*items: runtimeItems,[\s\S]*shareSlug,[\s\S]*shuffleItems: settings\.shuffleItems/,
    'publicPayloadUsesOrdering'
  );
  assert.match(
    publishSource,
    /key: 'shuffleItems',/,
    'publishPreviewExposesPolicy'
  );
  assert.match(
    resultsExportSource,
    /deliveryView\.itemOrder,[\s\S]*shuffleItems: exportSettings\.shuffleItems/,
    'resultExportExposesPolicy'
  );
  assert.match(
    apiSource,
    /buildPublicAttemptReviewSummaryView\(\{[\s\S]*runtimeItems: orderedRuntimeItems/,
    'studentReviewUsesOrderedRuntimeItems'
  );
  assert.match(
    studentRunnerSource,
    /orderStudentRunnerRuntimeItems[\s\S]*orderAssignmentRuntimeItems\(\{[\s\S]*shareSlug: normalizeAssignmentShareSlug\(assignment\.shareId\)/,
    'studentRunnerPreviewUsesOrdering'
  );
  assert.match(
    apiSource,
    /submitAttempt[\s\S]*const orderedRuntimeItems = orderAssignmentRuntimeItems\(\{[\s\S]*items: resolvedSource\.runtimeItems,[\s\S]*shareSlug: row\.assignment\.shareSlug,[\s\S]*shuffleItems: settings\.shuffleItems/,
    'studentSubmitUsesOrdering'
  );
});
