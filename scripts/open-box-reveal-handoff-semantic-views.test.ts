import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import {
  buildOpenBoxRevealHandoffView,
  OPEN_BOX_REVEAL_HANDOFF_ITEM_IDS,
  type OpenBoxRevealHandoffItemId,
  type OpenBoxRevealHandoffView,
} from '@/assignments/open-box-reveal-handoff';
import { buildSequentialStudentRunnerView } from '@/assignments/student-runner-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_OPEN_BOX_ANSWER';
const SECRET_EXPLANATION_TEXT = 'SECRET_OPEN_BOX_EXPLANATION';
const SECRET_PROMPT_TEXT = 'SECRET_OPEN_BOX_PROMPT';
const SECRET_RUNTIME_ITEM_ID = 'secret-open-box-item-id';
const SECRET_RUNTIME_ITEM_ID_TWO = 'secret-open-box-item-id-two';
const SECRET_SOURCE_MATERIAL = 'secret-source-material.pdf';
const SECRET_STUDENT_NAME = 'Private Open Box Student';
const SECRET_TOKEN = 'raw-open-box-token';

test('open-box reveal handoff exposes 30 safe reveal-card slices', () => {
  const handoffView = buildOpenBoxRevealHandoffView({
    runnerView: buildOpenBoxSequentialRunnerView({
      activeItemId: SECRET_RUNTIME_ITEM_ID_TWO,
      answers: {
        [SECRET_RUNTIME_ITEM_ID]: SECRET_ANSWER_TEXT,
        orphan: SECRET_ANSWER_TEXT,
      },
      items: buildOpenBoxItems(),
      revealAnswer: true,
      reviewItems: buildOpenBoxReviewItems(),
    }),
    revealAnswer: true,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...OPEN_BOX_REVEAL_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    exposesAnswerKeys: false,
    exposesAnswerText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentIdentity: false,
    itemIds,
    runnerSurface: 'open-box',
    scope: 'open-box-reveal-card',
    templateType: 'open-box',
    usesSharedSubmissionContract: true,
  });

  assert.equal(getHandoffValue(handoffView, 'template-type'), 'open-box');
  assert.equal(getHandoffValue(handoffView, 'runner-surface'), 'open-box');
  assert.equal(getHandoffValue(handoffView, 'reveal-card-state'), 'Active');
  assert.equal(getHandoffValue(handoffView, 'box-count'), '2 boxes');
  assert.equal(
    getHandoffValue(handoffView, 'visible-prompt-count'),
    '1 prompt'
  );
  assert.equal(getHandoffValue(handoffView, 'active-box-state'), 'Selected');
  assert.equal(getHandoffValue(handoffView, 'active-box-validity'), 'Valid');
  assert.equal(getHandoffValue(handoffView, 'selected-box-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'answered-box-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'unanswered-box-count'), '1');
  assert.equal(
    getHandoffValue(handoffView, 'completion-progress'),
    '1 of 2 answered'
  );
  assert.equal(getHandoffValue(handoffView, 'navigation-state'), 'Available');
  assert.equal(getHandoffValue(handoffView, 'previous-action'), 'Available');
  assert.equal(getHandoffValue(handoffView, 'next-action'), 'Available');
  assert.equal(
    getHandoffValue(handoffView, 'direct-box-selection'),
    'Available'
  );
  assert.equal(getHandoffValue(handoffView, 'answer-input-state'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'disabled-action-policy'),
    'Actions enabled'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-feedback-state'),
    'Visible'
  );
  assert.equal(getHandoffValue(handoffView, 'review-item-count'), '2');
  assert.equal(
    getHandoffValue(handoffView, 'accepted-answer-boundary'),
    'Post-submit only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'explanation-boundary'),
    'Post-submit only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'prompt-text-guard'),
    'Prompts hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'runtime-item-id-guard'),
    'Item ids hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'answer-text-guard'),
    'Answers hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-identity-guard'),
    'Student identity hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'source-material-guard'),
    'Source materials hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-payload-boundary'),
    'Sanitized runtime'
  );
  assert.equal(
    getHandoffValue(handoffView, 'submission-contract'),
    '{ itemId, answer }'
  );
  assert.equal(
    getHandoffValue(handoffView, 'result-review-boundary'),
    'Teacher results unchanged'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );

  assertNoPrivateOpenBoxText(JSON.stringify(handoffView));
});

test('open-box reveal handoff reports locked single-box state', () => {
  const handoffView = buildOpenBoxRevealHandoffView({
    disabled: true,
    runnerView: buildOpenBoxSequentialRunnerView({
      items: [buildOpenBoxItems()[0] as PublicRuntimeItem],
    }),
  });

  assert.equal(getHandoffValue(handoffView, 'box-count'), '1 box');
  assert.equal(getHandoffValue(handoffView, 'navigation-state'), 'Single box');
  assert.equal(getHandoffValue(handoffView, 'previous-action'), 'Unavailable');
  assert.equal(getHandoffValue(handoffView, 'next-action'), 'Unavailable');
  assert.equal(getHandoffValue(handoffView, 'answer-input-state'), 'Locked');
  assert.equal(
    getHandoffValue(handoffView, 'disabled-action-policy'),
    'Actions locked'
  );
  assert.equal(getHandoffValue(handoffView, 'review-feedback-state'), 'Hidden');
  assert.equal(getHandoffValue(handoffView, 'review-item-count'), '0');

  assertNoPrivateOpenBoxText(JSON.stringify(handoffView));
});

test('open-box reveal handoff localizes Chinese reveal boundaries', () => {
  try {
    overwriteGetLocale(() => 'zh');

    const handoffView = buildOpenBoxRevealHandoffView({
      runnerView: buildOpenBoxSequentialRunnerView({
        answers: {
          [SECRET_RUNTIME_ITEM_ID]: SECRET_ANSWER_TEXT,
        },
        items: buildOpenBoxItems(),
      }),
    });

    assert.equal(handoffView.title, '翻盒交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(getHandoffValue(handoffView, 'reveal-card-state'), '已启用');
    assert.equal(getHandoffValue(handoffView, 'box-count'), '2 个盒子');
    assert.equal(
      getHandoffValue(handoffView, 'visible-prompt-count'),
      '1 个提示'
    );
    assert.equal(
      getHandoffValue(handoffView, 'completion-progress'),
      '1/2 已作答'
    );
    assert.equal(
      getHandoffValue(handoffView, 'public-payload-boundary'),
      '清理后的运行内容'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私有数据'
    );

    assertNoPrivateOpenBoxText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('open-box runner attaches the reveal-card handoff to the component', () => {
  const source = readFileSync(
    'src/components/activities/open-box-runner.tsx',
    'utf8'
  );

  assert.match(
    source,
    /buildOpenBoxRevealHandoffView[\s\S]*disabled,[\s\S]*revealAnswer,[\s\S]*runnerView,/
  );
  assert.match(source, /data-handoff="open-box-reveal-card"/);
  assert.match(
    source,
    /view\.itemViews\.map\(\(item\) =>[\s\S]*OpenBoxRevealHandoffItem[\s\S]*function OpenBoxRevealHandoffItem[\s\S]*item: OpenBoxRevealHandoffItemView[\s\S]*const labelId = `open-box-reveal-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `open-box-reveal-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId = `open-box-reveal-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
});

test('open-box reveal focused gate is documented', () => {
  const catalogSource = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
  const normalizedCatalog = catalogSource.replace(/\s+/g, ' ');

  assert.match(
    catalogSource,
    /pnpm exec tsx --test scripts\/open-box-reveal-handoff-semantic-views\.test\.ts/
  );
  for (const boundary of [
    'reveal-card state',
    'box and prompt counts',
    'navigation actions',
    'answer-input state',
    'review feedback',
    'prompt/item-id/answer/student/source-material guards',
    'hidden open-box-reveal-card handoff',
  ]) {
    assert.match(normalizedCatalog, new RegExp(boundary));
  }
});

function buildOpenBoxSequentialRunnerView({
  activeItemId,
  answers = {},
  items = buildOpenBoxItems(),
  revealAnswer = false,
  reviewItems,
}: {
  activeItemId?: string;
  answers?: Record<string, string>;
  items?: PublicRuntimeItem[];
  revealAnswer?: boolean;
  reviewItems?: PublicAttemptReviewItem[];
}) {
  return buildSequentialStudentRunnerView({
    activeItemId,
    answers,
    itemLabel: 'Box',
    items,
    revealAnswer,
    reviewItems,
  });
}

function buildOpenBoxItems(): PublicRuntimeItem[] {
  return [
    {
      id: SECRET_RUNTIME_ITEM_ID,
      kind: 'question',
      prompt: SECRET_PROMPT_TEXT,
    },
    {
      id: SECRET_RUNTIME_ITEM_ID_TWO,
      kind: 'question',
      prompt: `${SECRET_PROMPT_TEXT}_TWO`,
    },
  ];
}

function buildOpenBoxReviewItems(): PublicAttemptReviewItem[] {
  return [
    {
      acceptedAnswers: [SECRET_ANSWER_TEXT],
      correct: true,
      correctAnswer: SECRET_ANSWER_TEXT,
      explanation: SECRET_EXPLANATION_TEXT,
      itemId: SECRET_RUNTIME_ITEM_ID,
      submitted: true,
      submittedAnswer: SECRET_ANSWER_TEXT,
    },
    {
      acceptedAnswers: [SECRET_ANSWER_TEXT],
      correct: false,
      correctAnswer: SECRET_ANSWER_TEXT,
      explanation: SECRET_EXPLANATION_TEXT,
      itemId: SECRET_RUNTIME_ITEM_ID_TWO,
      submitted: false,
      submittedAnswer: '',
    },
  ];
}

function getHandoffValue(
  view: OpenBoxRevealHandoffView,
  id: OpenBoxRevealHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing open-box reveal handoff item ${id}`);
  return item.value;
}

function assertNoPrivateOpenBoxText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_EXPLANATION_TEXT,
    SECRET_PROMPT_TEXT,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_RUNTIME_ITEM_ID_TWO,
    SECRET_SOURCE_MATERIAL,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Open-box reveal handoff leaked private text: ${privateValue}`
    );
  }
}
