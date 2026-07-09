import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS,
  buildPublicAssignmentRuleSummaryView,
  type PublicAssignmentRulesHandoffItemId,
  type PublicAssignmentRulesHandoffView,
} from '@/assignments/delivery-summary';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_TEACHER_ANSWER';
const SECRET_CHOICE = 'SECRET_CHOICE_TEXT';
const SECRET_PROMPT = 'SECRET_PROMPT_TEXT';
const SECRET_SETTINGS_JSON = '{"answer":"SECRET_TEACHER_ANSWER"}';
const SECRET_SHARE_SLUG = 'private-share-slug';
const SECRET_STUDENT_NAME = 'Private Student';
const SECRET_TOKEN = 'raw-anonymous-token';

const COMPONENT_SOURCE = readFileSync(
  'src/components/assignments/public-assignment-rules.tsx',
  'utf8'
);
const DELIVERY_SUMMARY_SOURCE = readFileSync(
  'src/assignments/delivery-summary.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('public assignment rules expose a safe 30-slice handoff view', () => {
  const summaryView = buildPublicAssignmentRuleSummaryView({
    collectStudentName: false,
    expiresAt: null,
    itemCount: 5,
    maxAttempts: 2,
    showCorrectAnswers: true,
    shuffleItems: false,
    timeLimitSeconds: 180,
  });
  const handoffView = summaryView.handoffView;
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(handoffView.title, 'Public assignment rules handoff');
  assert.match(handoffView.description, /30-slice public assignment rules/);
  assert.deepEqual(handoffView.privacy, {
    exposesAcceptedAlternatives: false,
    exposesAnswerKeys: false,
    exposesRawSettingsJson: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesShareSlug: false,
    exposesStudentAnswerText: false,
    exposesStudentNames: false,
    exposesTeacherSourceMaterials: false,
    itemIds,
    mutatesAssignment: false,
    scope: 'public-assignment-rules',
    usesResolvedSettings: true,
  });
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
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['summary-source', 'PublicAssignmentRuleSummaryView'],
      ['visible-rule-panel', 'Assignment rules'],
      ['status-badge', 'Timer on'],
      ['rule-count', '7 rules'],
      [
        'delivery-rule-order',
        'items · attempts · timer · closes · identity · answerReveal · itemOrder',
      ],
      ['item-count', '5 items'],
      ['items-rule-state', '5 items'],
      ['attempt-limit', '2 max'],
      ['attempts-rule-state', '2 max'],
      ['timer-policy', '3 min'],
      ['timer-rule-state', '3 min'],
      ['close-time-policy', 'No close time'],
      ['close-time-rule-state', 'No close time'],
      ['identity-mode', 'Anonymous'],
      ['identity-rule-state', 'Anonymous'],
      ['review-behavior', 'After submit'],
      ['review-rule-state', 'After submit'],
      ['item-order', 'Fixed order'],
      ['item-order-rule-state', 'Fixed order'],
      ['timer-start-boundary', 'After activity ready'],
      ['anonymous-browser-boundary', 'Browser token hidden'],
      ['normalized-identity-boundary', 'Normalized before attempts'],
      ['post-submit-review-boundary', 'After scoring'],
      ['settings-resolution-boundary', 'Resolved settings'],
      ['status-derivation-boundary', 'timed'],
      ['public-payload-boundary', 'Sanitized rules'],
      ['runtime-content-guard', 'Prompts and choices hidden'],
      ['teacher-settings-guard', 'Raw settings hidden'],
      ['answer-key-guard', 'Answer keys hidden'],
      ['privacy-guard', 'Private data hidden'],
    ]
  );
  assertNoPrivateRuleText(JSON.stringify(handoffView));
});

test('public assignment rules handoff mirrors timer, identity, and review states', () => {
  const summaryView = buildPublicAssignmentRuleSummaryView({
    collectStudentName: true,
    expiresAt: null,
    itemCount: 1,
    maxAttempts: null,
    showCorrectAnswers: false,
    shuffleItems: true,
    timeLimitSeconds: null,
  });
  const handoffView = summaryView.handoffView;

  assert.equal(getHandoffValue(handoffView, 'status-badge'), 'Open link');
  assert.equal(getHandoffValue(handoffView, 'rule-count'), '7 rules');
  assert.equal(getHandoffValue(handoffView, 'item-count'), '1 item');
  assert.equal(getHandoffValue(handoffView, 'items-rule-state'), '1 item');
  assert.equal(getHandoffValue(handoffView, 'attempt-limit'), 'Open');
  assert.equal(getHandoffValue(handoffView, 'attempts-rule-state'), 'Open');
  assert.equal(getHandoffValue(handoffView, 'timer-policy'), 'No timer');
  assert.equal(getHandoffValue(handoffView, 'timer-rule-state'), 'No timer');
  assert.equal(
    getHandoffValue(handoffView, 'timer-start-boundary'),
    'No timer'
  );
  assert.equal(getHandoffValue(handoffView, 'identity-mode'), 'Names');
  assert.equal(getHandoffValue(handoffView, 'identity-rule-state'), 'Names');
  assert.equal(
    getHandoffValue(handoffView, 'anonymous-browser-boundary'),
    'Name entry visible'
  );
  assert.equal(getHandoffValue(handoffView, 'review-behavior'), 'Hidden');
  assert.equal(getHandoffValue(handoffView, 'review-rule-state'), 'Hidden');
  assert.equal(
    getHandoffValue(handoffView, 'post-submit-review-boundary'),
    'Review hidden'
  );
  assert.equal(getHandoffValue(handoffView, 'item-order'), 'Shuffled');
  assert.equal(
    getHandoffValue(handoffView, 'item-order-rule-state'),
    'Shuffled'
  );
  assert.equal(
    getHandoffValue(handoffView, 'status-derivation-boundary'),
    'open'
  );
  assertNoPrivateRuleText(JSON.stringify(handoffView));
});

test('public assignment rules handoff localizes Chinese boundary values', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const summaryView = buildPublicAssignmentRuleSummaryView({
      collectStudentName: false,
      expiresAt: null,
      itemCount: 5,
      maxAttempts: 2,
      showCorrectAnswers: true,
      shuffleItems: false,
      timeLimitSeconds: 180,
    });
    const handoffView = summaryView.handoffView;

    assert.equal(handoffView.title, '公开作业规则交接');
    assert.match(handoffView.description, /30 切片公开作业规则交接/);
    assert.equal(
      getHandoffValue(handoffView, 'visible-rule-panel'),
      '作业规则'
    );
    assert.equal(getHandoffValue(handoffView, 'status-badge'), '已开启计时');
    assert.equal(getHandoffValue(handoffView, 'rule-count'), '7 条规则');
    assert.equal(
      getHandoffValue(handoffView, 'delivery-rule-order'),
      'items · attempts · timer · closes · identity · answerReveal · itemOrder'
    );
    assert.equal(getHandoffValue(handoffView, 'item-count'), '5 项');
    assert.equal(getHandoffValue(handoffView, 'items-rule-state'), '5 项');
    assert.equal(getHandoffValue(handoffView, 'attempt-limit'), '最多 2 次');
    assert.equal(
      getHandoffValue(handoffView, 'attempts-rule-state'),
      '最多 2 次'
    );
    assert.equal(getHandoffValue(handoffView, 'timer-policy'), '3 分钟');
    assert.equal(getHandoffValue(handoffView, 'timer-rule-state'), '3 分钟');
    assert.equal(
      getHandoffValue(handoffView, 'close-time-policy'),
      '不设关闭时间'
    );
    assert.equal(
      getHandoffValue(handoffView, 'close-time-rule-state'),
      '不设关闭时间'
    );
    assert.equal(getHandoffValue(handoffView, 'identity-mode'), '匿名');
    assert.equal(getHandoffValue(handoffView, 'identity-rule-state'), '匿名');
    assert.equal(getHandoffValue(handoffView, 'review-behavior'), '提交后显示');
    assert.equal(
      getHandoffValue(handoffView, 'review-rule-state'),
      '提交后显示'
    );
    assert.equal(getHandoffValue(handoffView, 'item-order'), '固定顺序');
    assert.equal(
      getHandoffValue(handoffView, 'item-order-rule-state'),
      '固定顺序'
    );
    assert.equal(
      getHandoffValue(handoffView, 'timer-start-boundary'),
      '活动准备后'
    );
    assert.equal(
      getHandoffValue(handoffView, 'anonymous-browser-boundary'),
      '浏览器 token 隐藏'
    );
    assert.equal(
      getHandoffValue(handoffView, 'runtime-content-guard'),
      '题干和选项隐藏'
    );
    assert.equal(
      getHandoffValue(handoffView, 'settings-resolution-boundary'),
      '已解析设置'
    );
    assert.equal(
      getHandoffValue(handoffView, 'status-derivation-boundary'),
      'timed'
    );
    assert.equal(
      getHandoffValue(handoffView, 'teacher-settings-guard'),
      '原始设置隐藏'
    );
    assert.equal(
      getHandoffValue(handoffView, 'answer-key-guard'),
      '答案 key 隐藏'
    );
    assertNoPrivateRuleText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('public assignment rules handoff renders stable hidden DOM relationships', () => {
  assert.match(
    COMPONENT_SOURCE,
    /summaryView\.items\.map\(\(rule\) =>[\s\S]*<PublicAssignmentRuleItem key=\{rule\.id\} rule=\{rule\} \/>[\s\S]*<PublicAssignmentRulesHandoff view=\{summaryView\.handoffView\} \/>/,
    'Public rules should render visible rule cards and the prepared hidden handoff view from the same summary view.'
  );
  assert.match(
    COMPONENT_SOURCE,
    /function PublicAssignmentRulesHandoff[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*className="sr-only"[\s\S]*data-handoff="public-assignment-rules"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*<dl>[\s\S]*view\.itemViews\.map\(\(itemView\) =>[\s\S]*PublicAssignmentRulesHandoffItem/,
    'Public rules handoff should expose a hidden scoped dl container.'
  );
  assert.match(
    COMPONENT_SOURCE,
    /function PublicAssignmentRulesHandoffItem[\s\S]*PublicAssignmentRulesHandoffItemView[\s\S]*const labelId = `public-assignment-rules-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `public-assignment-rules-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `public-assignment-rules-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*<dt id=\{labelId\}>[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Each public rule handoff item should keep stable label, value, and description relationships.'
  );
});

test('public assignment rules handoff contract is documented', () => {
  assert.match(
    DELIVERY_SUMMARY_SOURCE,
    /export const PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS = \[(?=[\s\S]*'summary-source')(?=[\s\S]*'visible-rule-panel')(?=[\s\S]*'status-badge')(?=[\s\S]*'rule-count')(?=[\s\S]*'delivery-rule-order')(?=[\s\S]*'item-count')(?=[\s\S]*'items-rule-state')(?=[\s\S]*'attempt-limit')(?=[\s\S]*'attempts-rule-state')(?=[\s\S]*'timer-policy')(?=[\s\S]*'timer-rule-state')(?=[\s\S]*'close-time-policy')(?=[\s\S]*'close-time-rule-state')(?=[\s\S]*'identity-mode')(?=[\s\S]*'identity-rule-state')(?=[\s\S]*'review-behavior')(?=[\s\S]*'review-rule-state')(?=[\s\S]*'item-order')(?=[\s\S]*'item-order-rule-state')(?=[\s\S]*'timer-start-boundary')(?=[\s\S]*'anonymous-browser-boundary')(?=[\s\S]*'normalized-identity-boundary')(?=[\s\S]*'post-submit-review-boundary')(?=[\s\S]*'settings-resolution-boundary')(?=[\s\S]*'status-derivation-boundary')(?=[\s\S]*'public-payload-boundary')(?=[\s\S]*'runtime-content-guard')(?=[\s\S]*'teacher-settings-guard')(?=[\s\S]*'answer-key-guard')(?=[\s\S]*'privacy-guard')/,
    'Public assignment rules should expose the full 30-slice handoff id contract.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/public-assignment-rules-handoff-semantic-views\.test\.ts/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /public rule panel[\s\S]*timer and identity boundaries[\s\S]*answer-key guard/
  );
});

function getHandoffValue(
  view: PublicAssignmentRulesHandoffView,
  id: PublicAssignmentRulesHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Expected public assignment rules handoff item ${id}`);
  return item.value;
}

function assertNoPrivateRuleText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER,
    SECRET_CHOICE,
    SECRET_PROMPT,
    SECRET_SETTINGS_JSON,
    SECRET_SHARE_SLUG,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Public assignment rules handoff leaked private text: ${privateValue}`
    );
  }
}
