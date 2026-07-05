import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { getRuntimeItems, type RuntimeItem } from '@/activities/runtime';
import type { ActivityContent } from '@/activities/types';
import {
  ASSIGNMENT_ITEM_ORDER_HANDOFF_ITEM_IDS,
  buildAssignmentItemOrderHandoffView,
  type AssignmentItemOrderHandoffEvidence,
  type AssignmentItemOrderHandoffItemId,
  type AssignmentItemOrderHandoffView,
} from '@/assignments/item-order-handoff';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { buildPublicAssignmentPayload } from '@/assignments/public';
import { buildPrintableAssignmentWorksheet } from '@/assignments/printable-worksheet';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_ORDER_ANSWER_SHOULD_NOT_LEAK';
const SECRET_CHOICE = 'SECRET_ORDER_CHOICE_SHOULD_NOT_LEAK';
const SECRET_PROMPT = 'SECRET_ORDER_PROMPT_SHOULD_NOT_LEAK';
const SECRET_SHARE_SLUG = 'SECRET_SHARE_SLUG_SHOULD_NOT_LEAK';
const SECRET_SOURCE_MATERIAL = 'SECRET_SOURCE_MATERIAL_SHOULD_NOT_LEAK';

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

test('assignment item order handoff exposes 30 safe delivery-policy slices', () => {
  const runtimeItems = getRuntimeItems('quiz', activityContent);
  const snapshotIds = getRuntimeItemIds(runtimeItems);
  const shuffledOnce = orderAssignmentRuntimeItems({
    items: runtimeItems,
    shareSlug: 'class-a-share',
    shuffleItems: true,
  });
  const shuffledAgain = orderAssignmentRuntimeItems({
    items: runtimeItems,
    shareSlug: '  class-a-share  ',
    shuffleItems: true,
  });
  const alternateShuffle = orderAssignmentRuntimeItems({
    items: runtimeItems,
    shareSlug: 'class-b-share',
    shuffleItems: true,
  });
  const fixedOrder = orderAssignmentRuntimeItems({
    items: runtimeItems,
    shareSlug: SECRET_SHARE_SLUG,
    shuffleItems: false,
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
  const evidence = buildEvidence({
    alternateShuffle,
    fixedOrder,
    printableWorksheetItemIds: printableWorksheet.items.map((item) => item.id),
    publicPayloadItemIds: publicPayload.runtimeItems.map((item) => item.id),
    runtimeItems,
    shuffledAgain,
    shuffledOnce,
    snapshotIds,
  });
  const handoffView = buildAssignmentItemOrderHandoffView(evidence);
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

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
  assert.deepEqual(itemIds, [...ASSIGNMENT_ITEM_ORDER_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (itemView) =>
        Boolean(itemView.ariaLabel) &&
        Boolean(itemView.description) &&
        Boolean(itemView.label) &&
        Boolean(itemView.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    exposesAnswerKeyText: false,
    exposesRawSettingsJson: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesShareSlug: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentAnswerText: false,
    itemIds,
    scope: 'assignment-item-order-delivery-policy',
    usesSharedOrderingHelper: true,
  });

  assert.equal(
    getHandoffValue(handoffView, 'delivery-policy-scope'),
    'Delivery policy'
  );
  assert.equal(getHandoffValue(handoffView, 'normalized-share-seed'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'shuffle-enabled-policy'),
    'Shuffled'
  );
  assert.equal(
    getHandoffValue(handoffView, 'fixed-order-policy'),
    'Fixed order'
  );
  assert.equal(getHandoffValue(handoffView, 'same-seed-stability'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'different-seed-isolation'),
    'Ready'
  );
  assert.equal(getHandoffValue(handoffView, 'input-array-guard'), 'Ready');
  assert.equal(getHandoffValue(handoffView, 'item-count-preserved'), '5 items');
  assert.equal(getHandoffValue(handoffView, 'item-id-set-preserved'), '5 ids');
  assert.equal(getHandoffValue(handoffView, 'unique-runtime-ids'), 'Unique');
  assert.equal(
    getHandoffValue(handoffView, 'snapshot-order-preserved'),
    'Snapshot order'
  );
  assert.equal(
    getHandoffValue(handoffView, 'shuffled-order-prepared'),
    'Stable shuffle'
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-payload-ordering'),
    'Ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-submit-ordering'),
    'Ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-review-ordering'),
    'Ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-runner-preview-ordering'),
    'Ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'printable-worksheet-ordering'),
    'Ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'delivery-summary-policy'),
    'Ready'
  );
  assert.equal(getHandoffValue(handoffView, 'publish-preview-policy'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'public-rule-summary-policy'),
    'Ready'
  );
  assert.equal(getHandoffValue(handoffView, 'result-export-policy'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'ordered-answer-contract'),
    'Ready'
  );
  assert.equal(getHandoffValue(handoffView, 'share-slug-boundary'), 'Hidden');
  assert.equal(getHandoffValue(handoffView, 'runtime-id-boundary'), 'Hidden');
  assert.equal(getHandoffValue(handoffView, 'prompt-text-boundary'), 'Hidden');
  assert.equal(getHandoffValue(handoffView, 'choice-text-boundary'), 'Hidden');
  assert.equal(getHandoffValue(handoffView, 'answer-key-boundary'), 'Hidden');
  assert.equal(
    getHandoffValue(handoffView, 'source-material-boundary'),
    'Hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'settings-json-boundary'),
    'Hidden'
  );
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), 'Hidden');

  assertNoPrivateOrderingText(JSON.stringify(handoffView));
});

test('assignment item order handoff keeps missing integration evidence explicit', () => {
  const handoffView = buildAssignmentItemOrderHandoffView({
    alternateSeedChangesOrder: false,
    deliverySummaryExposesPolicy: false,
    fixedOrderMatchesSnapshot: false,
    inputArrayPreserved: false,
    itemCount: 0,
    itemIdSetPreserved: false,
    normalizedShareSeedMatches: false,
    orderedAnswerContractUsesRuntimeItems: false,
    printableWorksheetUsesOrdering: false,
    publicAccessExposesPolicy: false,
    publicPayloadUsesOrdering: false,
    publishPreviewExposesPolicy: false,
    resultExportExposesPolicy: false,
    runtimeIdsUnique: false,
    sameSeedStable: false,
    shuffledOrderChanged: false,
    studentReviewUsesOrderedRuntimeItems: false,
    studentRunnerPreviewUsesOrdering: false,
    studentSubmitUsesOrdering: false,
  });

  assert.deepEqual(
    handoffView.itemViews.map((itemView) => itemView.id),
    [...ASSIGNMENT_ITEM_ORDER_HANDOFF_ITEM_IDS]
  );
  assert.equal(
    getHandoffValue(handoffView, 'normalized-share-seed'),
    'Missing'
  );
  assert.equal(getHandoffValue(handoffView, 'same-seed-stability'), 'Missing');
  assert.equal(getHandoffValue(handoffView, 'unique-runtime-ids'), 'Blocked');
  assert.equal(
    getHandoffValue(handoffView, 'snapshot-order-preserved'),
    'Blocked'
  );
  assert.equal(
    getHandoffValue(handoffView, 'shuffled-order-prepared'),
    'Blocked'
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-payload-ordering'),
    'Missing'
  );
  assertNoPrivateOrderingText(JSON.stringify(handoffView));
});

test('assignment item order handoff localizes Chinese order boundaries', () => {
  overwriteGetLocale(() => 'zh');

  const handoffView = buildAssignmentItemOrderHandoffView({
    ...buildPassingEvidence(),
    itemCount: 3,
  });

  assert.equal(handoffView.title, '题目顺序交接');
  assert.match(handoffView.description, /30 个切片/);
  assert.equal(
    getHandoffValue(handoffView, 'delivery-policy-scope'),
    '投放规则'
  );
  assert.equal(
    getHandoffValue(handoffView, 'shuffle-enabled-policy'),
    '随机顺序'
  );
  assert.equal(getHandoffValue(handoffView, 'fixed-order-policy'), '固定顺序');
  assert.equal(
    getHandoffValue(handoffView, 'item-count-preserved'),
    '3 个项目'
  );
  assert.equal(
    getHandoffValue(handoffView, 'item-id-set-preserved'),
    '3 个 ID'
  );
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '已隐藏');

  overwriteGetLocale(() => 'en');
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

function buildEvidence({
  alternateShuffle,
  fixedOrder,
  printableWorksheetItemIds,
  publicPayloadItemIds,
  runtimeItems,
  shuffledAgain,
  shuffledOnce,
  snapshotIds,
}: {
  alternateShuffle: RuntimeItem[];
  fixedOrder: RuntimeItem[];
  printableWorksheetItemIds: string[];
  publicPayloadItemIds: string[];
  runtimeItems: RuntimeItem[];
  shuffledAgain: RuntimeItem[];
  shuffledOnce: RuntimeItem[];
  snapshotIds: string[];
}): AssignmentItemOrderHandoffEvidence {
  const shuffledIds = getRuntimeItemIds(shuffledOnce);
  const sourceEvidence = buildSourceEvidence();

  return {
    alternateSeedChangesOrder: !arraysEqual(
      shuffledIds,
      getRuntimeItemIds(alternateShuffle)
    ),
    deliverySummaryExposesPolicy: sourceEvidence.deliverySummaryExposesPolicy,
    fixedOrderMatchesSnapshot: arraysEqual(
      getRuntimeItemIds(fixedOrder),
      snapshotIds
    ),
    inputArrayPreserved: arraysEqual(
      getRuntimeItemIds(runtimeItems),
      snapshotIds
    ),
    itemCount: runtimeItems.length,
    itemIdSetPreserved: sameSet(shuffledIds, snapshotIds),
    normalizedShareSeedMatches:
      normalizeAssignmentShareSlug('  class-a-share  ') === 'class-a-share',
    orderedAnswerContractUsesRuntimeItems:
      sourceEvidence.orderedAnswerContractUsesRuntimeItems,
    printableWorksheetUsesOrdering:
      sourceEvidence.printableWorksheetUsesOrdering &&
      arraysEqual(printableWorksheetItemIds, shuffledIds),
    publicAccessExposesPolicy: sourceEvidence.publicAccessExposesPolicy,
    publicPayloadUsesOrdering:
      sourceEvidence.publicPayloadUsesOrdering &&
      arraysEqual(publicPayloadItemIds, shuffledIds),
    publishPreviewExposesPolicy: sourceEvidence.publishPreviewExposesPolicy,
    resultExportExposesPolicy: sourceEvidence.resultExportExposesPolicy,
    runtimeIdsUnique: new Set(snapshotIds).size === snapshotIds.length,
    sameSeedStable: arraysEqual(shuffledIds, getRuntimeItemIds(shuffledAgain)),
    shuffledOrderChanged: !arraysEqual(shuffledIds, snapshotIds),
    studentReviewUsesOrderedRuntimeItems:
      sourceEvidence.studentReviewUsesOrderedRuntimeItems,
    studentRunnerPreviewUsesOrdering:
      sourceEvidence.studentRunnerPreviewUsesOrdering,
    studentSubmitUsesOrdering: sourceEvidence.studentSubmitUsesOrdering,
  };
}

function buildPassingEvidence(): AssignmentItemOrderHandoffEvidence {
  return {
    alternateSeedChangesOrder: true,
    deliverySummaryExposesPolicy: true,
    fixedOrderMatchesSnapshot: true,
    inputArrayPreserved: true,
    itemCount: 5,
    itemIdSetPreserved: true,
    normalizedShareSeedMatches: true,
    orderedAnswerContractUsesRuntimeItems: true,
    printableWorksheetUsesOrdering: true,
    publicAccessExposesPolicy: true,
    publicPayloadUsesOrdering: true,
    publishPreviewExposesPolicy: true,
    resultExportExposesPolicy: true,
    runtimeIdsUnique: true,
    sameSeedStable: true,
    shuffledOrderChanged: true,
    studentReviewUsesOrderedRuntimeItems: true,
    studentRunnerPreviewUsesOrdering: true,
    studentSubmitUsesOrdering: true,
  };
}

function buildSourceEvidence() {
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

  return {
    deliverySummaryExposesPolicy:
      /id: 'itemOrder'[\s\S]*formatShuffleItems\(shuffleItems\)/.test(
        deliverySummarySource
      ),
    orderedAnswerContractUsesRuntimeItems:
      /assertSubmittedAnswersMatchRuntimeItems\(\{[\s\S]*runtimeItems: orderedRuntimeItems/.test(
        apiSource
      ),
    printableWorksheetUsesOrdering:
      /buildPrintableAssignmentWorksheet[\s\S]*const orderedRuntimeItems = orderAssignmentRuntimeItems\(\{[\s\S]*items: runtimeItems,[\s\S]*shareSlug,[\s\S]*shuffleItems: settings\.shuffleItems/.test(
        printableSource
      ),
    publicAccessExposesPolicy:
      /case 'shuffle-policy':[\s\S]*buildPublicAssignmentAccessRuleHandoffItem\([\s\S]*'itemOrder'[\s\S]*id/.test(
        publicSource
      ),
    publicPayloadUsesOrdering:
      /buildPublicAssignmentPayload[\s\S]*const orderedRuntimeItems = orderAssignmentRuntimeItems\(\{[\s\S]*items: runtimeItems,[\s\S]*shareSlug,[\s\S]*shuffleItems: settings\.shuffleItems/.test(
        publicSource
      ),
    publishPreviewExposesPolicy:
      /id: 'item-order-policy'[\s\S]*label: itemOrderPolicy\.label,[\s\S]*value: itemOrderPolicy\.value/.test(
        publishSource
      ) &&
      /getAssignmentPublishToggleDescription\([\s\S]*toggleViews,[\s\S]*'shuffleItems'/.test(
        publishSource
      ),
    resultExportExposesPolicy:
      /'delivery-item-order'[\s\S]*shuffleItems: exportSettings\.shuffleItems/.test(
        resultsExportSource
      ),
    studentReviewUsesOrderedRuntimeItems:
      /buildPublicAttemptReviewSummaryView\(\{[\s\S]*runtimeItems: orderedRuntimeItems/.test(
        apiSource
      ),
    studentRunnerPreviewUsesOrdering:
      /orderStudentRunnerRuntimeItems[\s\S]*orderAssignmentRuntimeItems\(\{[\s\S]*shareSlug: normalizeAssignmentShareSlug\(assignment\.shareId\)/.test(
        studentRunnerSource
      ),
    studentSubmitUsesOrdering:
      /submitAttempt[\s\S]*const orderedRuntimeItems = orderAssignmentRuntimeItems\(\{[\s\S]*items: resolvedSource\.runtimeItems,[\s\S]*shareSlug: row\.assignment\.shareSlug,[\s\S]*shuffleItems: settings\.shuffleItems/.test(
        apiSource
      ),
  };
}

function readProjectFile(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function getRuntimeItemIds(items: Array<Pick<RuntimeItem, 'id'>>) {
  return items.map((item) => item.id);
}

function arraysEqual(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    left.every((item, index) => item === right[index])
  );
}

function sameSet(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((item) => rightSet.has(item));
}

function getHandoffValue(
  view: AssignmentItemOrderHandoffView,
  id: AssignmentItemOrderHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing assignment item order handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateOrderingText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER,
    SECRET_CHOICE,
    SECRET_PROMPT,
    SECRET_SHARE_SLUG,
    SECRET_SOURCE_MATERIAL,
    'item-alpha',
    'item-bravo',
    'item-charlie',
    'class-a-share',
    'class-b-share',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Assignment item order handoff leaked private text: ${privateValue}`
    );
  }
}
