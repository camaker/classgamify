import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildLegalPolicyPageViewModel,
  LEGAL_POLICY_HANDOFF_ITEM_IDS,
  LEGAL_POLICY_PAGE_IDS,
  type LegalPolicyHandoffItemId,
  type LegalPolicyHandoffView,
  type LegalPolicyPageId,
} from '@/pages/legal-policy-view';
import { getPageBySlug } from '@/lib/pages';
import { Routes } from '@/lib/routes';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_KEY = 'SECRET_ANSWER_KEY';
const SECRET_AI_PROVIDER_SECRET = 'image-generation-provider-secret';
const SECRET_ATTEMPT_RECORD = 'SECRET_STUDENT_ATTEMPT_RECORD';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_TOKEN = 'raw-anonymous-student-token';
const SECRET_TEACHER_ACTIVITY_CONTENT = 'SECRET_TEACHER_ACTIVITY_CONTENT';
const SECRET_WORKSHEET_BYTES = 'raw-private-worksheet-bytes';

const POLICY_ROUTES = {
  cookie: Routes.CookiePolicy,
  privacy: Routes.PrivacyPolicy,
  terms: Routes.TermsOfService,
} satisfies Record<LegalPolicyPageId, string>;

test('legal policy handoff exposes 30 safe public policy slices', () => {
  for (const policyId of LEGAL_POLICY_PAGE_IDS) {
    const page = getPolicyPage(policyId, 'en');
    const pageView = buildLegalPolicyPageViewModel({ page, policyId });
    const handoffView = pageView.handoffView;
    const itemIds = handoffView.itemViews.map((item) => item.id);

    assert.equal(pageView.policyId, policyId);
    assert.deepEqual(itemIds, [...LEGAL_POLICY_HANDOFF_ITEM_IDS]);
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
      createsAssignmentLinks: false,
      describesAiDraftDataModel: true,
      describesAssignmentSnapshots: true,
      describesPublicAssignmentLinks: true,
      describesStudentAttempts: true,
      describesTeacherActivities: true,
      describesTeacherResults: true,
      exposesAnswerKeys: false,
      exposesRawAnonymousToken: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentAttemptRecords: false,
      exposesTeacherPrivateActivityContent: false,
      itemIds,
      keepsLegacyCopyOut: true,
      scope: 'public-legal-policy-product-boundary',
    });
    assertNoPrivateLegalPolicyText(JSON.stringify(handoffView));
  }
});

test('legal policy handoff resolves page-specific policy values', () => {
  const termsView = buildLegalPolicyPageViewModel({
    page: getPolicyPage('terms', 'en'),
    policyId: 'terms',
  }).handoffView;
  const privacyView = buildLegalPolicyPageViewModel({
    page: getPolicyPage('privacy', 'en'),
    policyId: 'privacy',
  }).handoffView;
  const cookieView = buildLegalPolicyPageViewModel({
    page: getPolicyPage('cookie', 'en'),
    policyId: 'cookie',
  }).handoffView;

  assert.deepEqual(
    termsView.itemViews.map((item) => [item.id, item.value]),
    [
      ['policy-set', '3 policies'],
      ['current-policy', 'Terms of Service'],
      ['current-route', Routes.TermsOfService],
      ['content-source', 'Content collections'],
      ['seo-description', 'Configured'],
      ['updated-date', '2026-07-02'],
      ['classgamify-product-boundary', 'Covered'],
      ['activity-content-model', 'Covered'],
      ['assignment-link-model', 'Covered'],
      ['assignment-snapshot-model', 'Covered'],
      ['student-attempt-model', 'Covered'],
      ['teacher-results-model', 'Covered'],
      ['csv-export-model', 'Teacher results'],
      ['source-material-model', 'Owner scoped'],
      ['ai-draft-model', 'Covered'],
      ['configured-ai-provider', 'Covered'],
      ['image-generation-provider-guard', 'Excluded'],
      ['payment-provider-scope', 'Creem / Stripe'],
      ['auth-provider-scope', 'Better Auth / Google'],
      ['storage-provider-scope', 'Classroom file storage'],
      ['analytics-provider-scope', 'Configured providers'],
      ['cookie-storage-scope', 'Browser storage'],
      ['anonymous-token-boundary', 'Raw tokens hidden'],
      ['answer-key-boundary', 'Teacher only'],
      ['student-sensitive-data-warning', 'Classroom only'],
      ['school-authority-boundary', 'Teacher authority'],
      ['retention-and-deletion', 'Documented'],
      ['third-party-provider-boundary', 'Provider terms apply'],
      ['legacy-copy-guard', 'ClassGamify only'],
      ['privacy-guard', 'Private data hidden'],
    ]
  );
  assert.equal(
    getHandoffValue(privacyView, 'current-route'),
    Routes.PrivacyPolicy
  );
  assert.equal(
    getHandoffValue(cookieView, 'current-route'),
    Routes.CookiePolicy
  );
  assert.equal(
    getHandoffValue(privacyView, 'current-policy'),
    'Privacy Policy'
  );
  assert.equal(getHandoffValue(cookieView, 'current-policy'), 'Cookie Policy');
});

test('legal policy handoff localizes Chinese classroom boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildLegalPolicyPageViewModel({
      page: getPolicyPage('privacy', 'zh'),
      policyId: 'privacy',
    }).handoffView;

    assert.equal(handoffView.title, '法律政策产品边界交接');
    assert.match(handoffView.description, /30 切片公开法律政策契约/);
    assert.equal(getHandoffValue(handoffView, 'policy-set'), '3 个政策');
    assert.equal(getHandoffValue(handoffView, 'current-policy'), '隐私政策');
    assert.equal(getHandoffValue(handoffView, 'content-source'), '内容集合');
    assert.equal(getHandoffValue(handoffView, 'seo-description'), '已配置');
    assert.equal(
      getHandoffValue(handoffView, 'configured-ai-provider'),
      '已覆盖'
    );
    assert.equal(
      getHandoffValue(handoffView, 'image-generation-provider-guard'),
      '已排除'
    );
    assert.equal(
      getHandoffValue(handoffView, 'legacy-copy-guard'),
      '仅 ClassGamify'
    );
    assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '私密数据隐藏');
    assertNoPrivateLegalPolicyText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('legal routes attach the shared semantic policy handoff', () => {
  const markdownPageSource = readFileSync(
    'src/components/page/markdown-page.tsx',
    'utf8'
  );

  assert.match(
    markdownPageSource,
    /data-handoff="legal-policy"[\s\S]*view\.itemViews\.map[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*<output aria-label=\{itemView\.ariaLabel\}>/
  );

  for (const [policyId, routePath] of Object.entries({
    cookie: 'src/routes/(legals)/cookie.tsx',
    privacy: 'src/routes/(legals)/privacy.tsx',
    terms: 'src/routes/(legals)/terms.tsx',
  }) as [LegalPolicyPageId, string][]) {
    const routeSource = readFileSync(routePath, 'utf8');

    assert.match(routeSource, /buildLegalPolicyPageViewModel/);
    assert.match(routeSource, new RegExp(`policyId: '${policyId}'`));
    assert.match(routeSource, /handoffView=\{pageView\.handoffView\}/);
    assert.match(routeSource, /page=\{pageView\.page\}/);
    assert.equal(POLICY_ROUTES[policyId], getHandoffRoute(policyId));
  }
});

function getPolicyPage(policyId: LegalPolicyPageId, locale: 'en' | 'zh') {
  const page = getPageBySlug(policyId, locale);
  assert.ok(page, `Missing ${locale} legal policy page for ${policyId}`);
  return page;
}

function getHandoffValue(
  view: LegalPolicyHandoffView,
  id: LegalPolicyHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing legal policy handoff item ${id}`);
  return item.value;
}

function getHandoffRoute(policyId: LegalPolicyPageId) {
  return getHandoffValue(
    buildLegalPolicyPageViewModel({
      page: getPolicyPage(policyId, 'en'),
      policyId,
    }).handoffView,
    'current-route'
  );
}

function assertNoPrivateLegalPolicyText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_KEY,
    SECRET_AI_PROVIDER_SECRET,
    SECRET_ATTEMPT_RECORD,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_ACTIVITY_CONTENT,
    SECRET_WORKSHEET_BYTES,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Legal policy handoff leaked private text: ${privateValue}`
    );
  }
}
