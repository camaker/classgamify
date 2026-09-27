import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildStudentRuntimeItemListView,
  STUDENT_RUNTIME_SEMANTIC_BUNDLE_HANDOFF_ITEM_IDS,
  type StudentRuntimeSemanticBundleHandoffItemId,
  type StudentRuntimeSemanticBundleHandoffView,
} from '@/assignments/student-runtime-item-list';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_BUNDLE_ANSWER';
const SECRET_CHOICE_TEXT = 'SECRET_BUNDLE_CHOICE';
const SECRET_CHOICE_TEXT_TWO = 'SECRET_BUNDLE_CHOICE_TWO';
const SECRET_PROMPT_TEXT = 'SECRET_BUNDLE_PROMPT';
const SECRET_RUNTIME_ITEM_ID = 'secret-bundle-runtime-item-id';
const SECRET_STUDENT_NAME = 'Bundle Private Student';
const SECRET_TOKEN = 'raw-bundle-anonymous-token';

test('student runtime semantic bundle exposes 30 sourced slices', () => {
  const bundleView = buildStudentRuntimeItemListView({
    answers: {
      [SECRET_RUNTIME_ITEM_ID]: SECRET_ANSWER_TEXT,
    },
    items: [
      {
        choices: [SECRET_CHOICE_TEXT, SECRET_CHOICE_TEXT_TWO],
        id: SECRET_RUNTIME_ITEM_ID,
        kind: 'question',
        prompt: SECRET_PROMPT_TEXT,
      },
    ],
    templateType: 'quiz',
  }).semanticBundleHandoffView;
  const itemIds = bundleView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...STUDENT_RUNTIME_SEMANTIC_BUNDLE_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    bundleView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.sourceItemId) &&
        Boolean(item.sourceScope) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(bundleView.privacy, {
    exposesAnswerText: false,
    exposesAnonymousToken: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentNames: false,
    exposesTeacherOnlyAnswers: false,
    itemIds,
    scope: 'public-student-runtime-semantic-bundle',
    sourceScopes: ['interaction', 'choice-assignment', 'identity'],
    templateType: 'quiz',
  });

  assert.deepEqual(
    bundleView.itemViews.map((item) => [
      item.id,
      item.sourceScope,
      item.sourceItemId,
    ]),
    [
      ['interaction-template-type', 'interaction', 'template-type'],
      ['interaction-runner-surface', 'interaction', 'runner-surface'],
      [
        'interaction-renderer-dispatch',
        'interaction',
        'renderer-dispatch-boundary',
      ],
      ['interaction-runtime-items', 'interaction', 'runtime-items'],
      ['interaction-kind-summary', 'interaction', 'runtime-kind-summary'],
      ['interaction-answer-contract', 'interaction', 'answer-contract'],
      ['interaction-selection-scope', 'interaction', 'selection-scope'],
      ['interaction-review-feedback', 'interaction', 'review-feedback'],
      ['interaction-disabled-state', 'interaction', 'disabled-state'],
      ['interaction-privacy-guard', 'interaction', 'privacy-guard'],
      ['choice-runner-surface', 'choice-assignment', 'runner-surface'],
      [
        'choice-exclusive-state',
        'choice-assignment',
        'exclusive-surface-state',
      ],
      ['choice-group-placement', 'choice-assignment', 'group-placement-state'],
      ['choice-choice-list', 'choice-assignment', 'choice-list-state'],
      [
        'choice-normalized-count',
        'choice-assignment',
        'normalized-choice-count',
      ],
      ['choice-selected-state', 'choice-assignment', 'selected-item-state'],
      [
        'choice-answer-change-contract',
        'choice-assignment',
        'answer-change-contract',
      ],
      [
        'choice-normalized-answer-scope',
        'choice-assignment',
        'normalized-answer-scope',
      ],
      ['choice-public-payload', 'choice-assignment', 'public-payload-boundary'],
      ['choice-privacy-guard', 'choice-assignment', 'privacy-guard'],
      ['identity-template-type', 'identity', 'template-type'],
      ['identity-runner-surface', 'identity', 'runner-surface'],
      ['identity-runtime-count', 'identity', 'runtime-item-count'],
      [
        'identity-normalized-id-count',
        'identity',
        'normalized-runtime-id-count',
      ],
      ['identity-unique-id-status', 'identity', 'unique-runtime-id-status'],
      [
        'identity-collision-guard',
        'identity',
        'multilingual-id-collision-guard',
      ],
      [
        'identity-submission-validation',
        'identity',
        'submission-validation-boundary',
      ],
      ['identity-public-payload', 'identity', 'public-payload-boundary'],
      [
        'identity-snapshot-boundary',
        'identity',
        'assignment-snapshot-boundary',
      ],
      ['identity-privacy-guard', 'identity', 'privacy-guard'],
    ]
  );
  assertNoPrivateSemanticBundleText(JSON.stringify(bundleView));
});

test('student runtime semantic bundle mirrors child handoff values', () => {
  const listView = buildStudentRuntimeItemListView({
    answers: {},
    disabled: true,
    items: [
      {
        id: SECRET_RUNTIME_ITEM_ID,
        kind: 'question',
        prompt: SECRET_PROMPT_TEXT,
      },
    ],
    language: '中文',
    revealAnswer: true,
    reviewItems: [
      {
        acceptedAnswers: [SECRET_ANSWER_TEXT],
        correct: false,
        correctAnswer: SECRET_ANSWER_TEXT,
        explanation: 'Teacher-only bundle explanation.',
        itemId: SECRET_RUNTIME_ITEM_ID,
        submitted: true,
        submittedAnswer: SECRET_ANSWER_TEXT,
      },
    ],
    templateType: 'listening',
  });
  const bundleView = listView.semanticBundleHandoffView;

  assert.equal(
    getBundleValue(bundleView, 'interaction-runner-surface'),
    getChildValue(listView.interactionHandoffView, 'runner-surface')
  );
  assert.equal(
    getBundleValue(bundleView, 'interaction-review-feedback'),
    getChildValue(listView.interactionHandoffView, 'review-feedback')
  );
  assert.equal(
    getBundleValue(bundleView, 'choice-normalized-answer-scope'),
    getChildValue(
      listView.runtimeChoiceAssignmentHandoffView,
      'normalized-answer-scope'
    )
  );
  assert.equal(
    getBundleValue(bundleView, 'identity-normalized-id-count'),
    getChildValue(
      listView.runtimeIdentityHandoffView,
      'normalized-runtime-id-count'
    )
  );
  assert.equal(bundleView.privacy.templateType, 'listening');
  assertNoPrivateSemanticBundleText(JSON.stringify(bundleView));
});

test('student runtime semantic bundle localizes sourced Chinese values', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const bundleView = buildStudentRuntimeItemListView({
      answers: {},
      items: [
        {
          choices: ['水果'],
          id: SECRET_RUNTIME_ITEM_ID,
          kind: 'group-item',
          prompt: '苹果',
        },
      ],
      templateType: 'group-sort',
    }).semanticBundleHandoffView;

    assert.match(bundleView.title, /运行交互交接/);
    assert.equal(
      getBundleValue(bundleView, 'interaction-template-type'),
      '分组分类'
    );
    assert.equal(
      getBundleValue(bundleView, 'choice-group-placement'),
      '已启用'
    );
    assert.equal(
      getBundleValue(bundleView, 'identity-collision-guard'),
      '碰撞安全'
    );
    assert.equal(
      getBundleValue(bundleView, 'identity-privacy-guard'),
      '已省略私密数据'
    );
    assertNoPrivateSemanticBundleText(JSON.stringify(bundleView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('student runtime semantic bundle renders hidden DOM relationships', () => {
  const componentSource = readFileSync(
    'src/components/activities/student-runtime-item-list.tsx',
    'utf8'
  );

  // docs/design.md: screen-reader-only text describes the visible UI and
  // must not add audit detail, so the student play page renders none.
  assert.doesNotMatch(
    componentSource,
    /data-handoff=/,
    'Runtime interaction region should not mount hidden audit handoffs.'
  );
  // docs/design.md: screen-reader-only text describes the visible UI and
  // must not add audit detail, so the student play page renders none.
  assert.doesNotMatch(
    componentSource,
    /function StudentRuntimeSemanticBundleHandoff\\b/,
    'Runtime item list should not define the hidden semantic bundle handoff.'
  );
  // docs/design.md: screen-reader-only text describes the visible UI and
  // must not add audit detail, so the student play page renders none.
  assert.doesNotMatch(
    componentSource,
    /function StudentRuntimeSemanticBundleHandoffItem\\b/,
    'Runtime item list should not define hidden semantic bundle items.'
  );
});

function getBundleValue(
  view: StudentRuntimeSemanticBundleHandoffView,
  id: StudentRuntimeSemanticBundleHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing runtime semantic bundle handoff item ${id}`);
  return item.value;
}

function getChildValue(
  view: {
    itemViews: Array<{
      id: string;
      value: string;
    }>;
  },
  id: string
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing child runtime handoff item ${id}`);
  return item.value;
}

function assertNoPrivateSemanticBundleText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_CHOICE_TEXT,
    SECRET_CHOICE_TEXT_TWO,
    SECRET_PROMPT_TEXT,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
    '苹果',
    '水果',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Student runtime semantic bundle leaked private text: ${privateValue}`
    );
  }
}
