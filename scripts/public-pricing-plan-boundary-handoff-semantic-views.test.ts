import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  PRICING_PAGE_HANDOFF_ITEM_IDS,
  buildPricingPageViewModel,
  type PricingPageHandoffItemId,
  type PricingPageHandoffView,
} from '@/pages/public-page-view';
import { Routes } from '@/lib/routes';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_CHECKOUT_SESSION = 'cs_secret_pricing_session';
const SECRET_PAYMENT_PROVIDER_KEY = 'sk_live_pricing_provider_secret';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/pricing-key.pdf';
const SECRET_STUDENT_ANSWER = 'student private result answer';
const SECRET_STUDENT_TOKEN = 'anonymous-pricing-browser-token';
const SECRET_TEACHER_ACTIVITY = 'private teacher activity content';

const PRICING_ROUTE_SOURCE = readFileSync(
  'src/routes/(pages)/pricing.tsx',
  'utf8'
);

test('public pricing handoff exposes 30 safe plan-boundary slices', () => {
  const pageView = buildPricingPageViewModel();
  const handoffView = pageView.handoffView;
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...PRICING_PAGE_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(handoffView.title, 'ClassGamify Plans');
  assert.match(handoffView.description, /classroom activity loop/);
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
    exposesCheckoutSessionIds: false,
    exposesPaymentProviderSecrets: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds,
    mutatesTeacherData: false,
    publishesAssignmentLinks: false,
    routeActionsUseSharedConstants: true,
    scope: 'public-pricing-plan-boundary',
  });

  assert.equal(getHandoffValue(handoffView, 'pricing-route'), Routes.Pricing);
  assert.equal(
    getHandoffValue(handoffView, 'product-loop'),
    'Activity -> Assignment -> Attempt -> Results'
  );
  assert.equal(
    getHandoffValue(handoffView, 'hero-positioning'),
    'ClassGamify Plans'
  );
  assert.equal(getHandoffValue(handoffView, 'value-section'), '3 items');
  assert.equal(
    getHandoffValue(handoffView, 'template-value'),
    'Template library'
  );
  assert.equal(
    getHandoffValue(handoffView, 'assignment-value'),
    'Activities and assignments'
  );
  assert.equal(getHandoffValue(handoffView, 'ai-value'), 'AI creation speed');
  assert.equal(
    getHandoffValue(handoffView, 'plan-source'),
    'ClassGamify plans'
  );
  assert.equal(getHandoffValue(handoffView, 'plan-count'), '3 items');
  assert.equal(getHandoffValue(handoffView, 'free-plan-boundary'), 'Starter');
  assert.equal(
    getHandoffValue(handoffView, 'pro-plan-boundary'),
    'Teacher Pro'
  );
  assert.equal(
    getHandoffValue(handoffView, 'lifetime-plan-boundary'),
    'Early Supporter'
  );
  assert.equal(
    getHandoffValue(handoffView, 'subscription-price-path'),
    '2 items'
  );
  assert.equal(getHandoffValue(handoffView, 'one-time-price-path'), '1 items');
  assert.equal(
    getHandoffValue(handoffView, 'free-preview-action'),
    Routes.Create
  );
  assert.equal(
    getHandoffValue(handoffView, 'authenticated-checkout'),
    'Hosted checkout after sign-in'
  );
  assert.equal(
    getHandoffValue(handoffView, 'hosted-checkout'),
    'Payment handled by the processor'
  );
  assert.equal(
    getHandoffValue(handoffView, 'payment-provider-boundary'),
    'Provider secrets hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'current-plan-context'),
    'Your Current Plan'
  );
  assert.equal(
    getHandoffValue(handoffView, 'billing-return-path'),
    Routes.Payment
  );
  assert.equal(
    getHandoffValue(handoffView, 'school-cta-path'),
    Routes.ContactClassroom
  );
  assert.equal(getHandoffValue(handoffView, 'faq-boundary'), '5 items');
  assert.equal(
    getHandoffValue(handoffView, 'student-account-boundary'),
    'Do students need accounts?'
  );
  assert.equal(
    getHandoffValue(handoffView, 'activity-library-access'),
    'Activity library'
  );
  assert.equal(
    getHandoffValue(handoffView, 'assignment-workflow-access'),
    'Assignment workflow'
  );
  assert.equal(getHandoffValue(handoffView, 'ai-draft-access'), 'AI drafts');
  assert.equal(
    getHandoffValue(handoffView, 'result-export-access'),
    'Result exports'
  );
  assert.equal(
    getHandoffValue(handoffView, 'source-material-access'),
    'Source materials'
  );
  assert.equal(
    getHandoffValue(handoffView, 'legacy-copy-guard'),
    'ClassGamify paths'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private billing data omitted'
  );
  assertNoPrivatePricingText(JSON.stringify(handoffView));
});

test('public pricing route renders the prepared handoff view', () => {
  assert.match(
    PRICING_ROUTE_SOURCE,
    /<PricingPageHandoffPanel view=\{pageView\.handoffView\} \/>/,
    'Pricing route should render the prepared plan-boundary handoff view.'
  );
  assert.match(
    PRICING_ROUTE_SOURCE,
    /data-handoff="public-pricing-plan-boundary"[\s\S]*view\.itemViews\.map\(\(item\) =>[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*aria-label=\{item\.ariaLabel\}/,
    'Pricing handoff panel should expose stable handoff ids and item aria labels.'
  );
  assert.doesNotMatch(
    PRICING_ROUTE_SOURCE,
    /Routes\.ContactClassroom[\s\S]*PricingPageHandoffPanel/,
    'Pricing route should keep handoff route values inside the prepared page model.'
  );
});

test('public pricing handoff localizes Chinese plan boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildPricingPageViewModel().handoffView;

    assert.equal(handoffView.title, 'ClassGamify 方案');
    assert.match(handoffView.description, /课堂活动闭环/);
    assert.equal(getHandoffValue(handoffView, 'pricing-route'), '/pricing');
    assert.equal(getHandoffValue(handoffView, 'value-section'), '3 个项目');
    assert.equal(getHandoffValue(handoffView, 'free-plan-boundary'), '入门版');
    assert.equal(
      getHandoffValue(handoffView, 'lifetime-plan-boundary'),
      '早期支持者'
    );
    assert.equal(
      getHandoffValue(handoffView, 'subscription-price-path'),
      '2 个项目'
    );
    assert.equal(
      getHandoffValue(handoffView, 'authenticated-checkout'),
      '登录后进入托管结账'
    );
    assert.equal(
      getHandoffValue(handoffView, 'hosted-checkout'),
      '支付由服务商安全处理'
    );
    assert.equal(
      getHandoffValue(handoffView, 'current-plan-context'),
      '您的当前方案'
    );
    assert.equal(
      getHandoffValue(handoffView, 'student-account-boundary'),
      '学生需要登录吗？'
    );
    assert.equal(
      getHandoffValue(handoffView, 'source-material-access'),
      '来源素材'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私密账单数据'
    );
    assertNoPrivatePricingText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffValue(
  view: PricingPageHandoffView,
  id: PricingPageHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing pricing handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivatePricingText(serializedView: string) {
  for (const privateValue of [
    SECRET_CHECKOUT_SESSION,
    SECRET_PAYMENT_PROVIDER_KEY,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_ACTIVITY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Pricing handoff leaked private text: ${privateValue}`
    );
  }
}
