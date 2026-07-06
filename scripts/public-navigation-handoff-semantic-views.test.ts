import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getFooterLinks } from '@/config/footer-config';
import { getNavbarLinks } from '@/config/navbar-config';
import { Routes } from '@/lib/routes';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import {
  buildPublicNavigationHandoffView,
  PUBLIC_NAVIGATION_HANDOFF_ITEM_IDS,
  type PublicNavigationHandoffItemId,
  type PublicNavigationHandoffView,
} from '@/navigation/public-navigation-handoff';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_KEY = 'SECRET_TEACHER_ANSWER_KEY';
const SECRET_ATTEMPT_RECORD = 'SECRET_STUDENT_ATTEMPT_RECORD';
const SECRET_FILE_BYTES = 'raw-private-worksheet-bytes';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/nav.pdf';
const SECRET_STUDENT_TOKEN = 'raw-anonymous-student-token';
const SECRET_TEACHER_CONTENT = 'SECRET_TEACHER_ACTIVITY_CONTENT';

const FOOTER_SOURCE = readFileSync('src/components/layout/footer.tsx', 'utf8');
const NAVBAR_SOURCE = readFileSync('src/components/layout/navbar.tsx', 'utf8');
const NAVBAR_MOBILE_SOURCE = readFileSync(
  'src/components/layout/navbar-mobile.tsx',
  'utf8'
);
const NAVBAR_CONFIG_SOURCE = readFileSync(
  'src/config/navbar-config.ts',
  'utf8'
);
const FOOTER_CONFIG_SOURCE = readFileSync(
  'src/config/footer-config.ts',
  'utf8'
);

test('public navigation handoff exposes 30 safe entrypoint slices', () => {
  const handoffView = buildPublicNavigationHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...PUBLIC_NAVIGATION_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(handoffView.title, 'Public navigation summary');
  assert.match(handoffView.description, /Public navigation summary/);
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
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    footerUsesSharedConfig: true,
    itemIds,
    keepsLegacyCopyOut: true,
    mobileNavUsesSharedConfig: true,
    mutatesTeacherWorkspace: false,
    navbarUsesSharedConfig: true,
    routeActionsUseSharedConstants: true,
    scope: 'public-navigation-entrypoints',
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-loop', 'Activity -> Assignment -> Attempt -> Results'],
      ['navbar-surface', 'Desktop and mobile navbar'],
      ['navbar-count', '6 items'],
      ['navbar-templates-route', Routes.Templates],
      ['navbar-worksheets-route', Routes.Worksheets],
      ['navbar-create-route', Routes.Create],
      ['navbar-student-preview-route', Routes.StudentPreview],
      ['navbar-pricing-route', Routes.Pricing],
      ['navbar-blog-route', Routes.Blog],
      ['mobile-navbar-source', 'Shared navigation choices'],
      ['footer-surface', 'Footer directory'],
      ['footer-section-count', '4 items'],
      ['footer-product-section', '5 items'],
      ['footer-product-templates-route', Routes.Templates],
      ['footer-product-worksheets-route', Routes.Worksheets],
      ['footer-product-create-route', Routes.Create],
      ['footer-product-preview-route', Routes.StudentPreview],
      ['footer-product-pricing-route', Routes.Pricing],
      ['footer-platform-activities-route', Routes.DashboardActivities],
      ['footer-platform-assignments-route', Routes.DashboardAssignments],
      ['footer-support-roadmap-route', Routes.Roadmap],
      ['footer-support-articles-route', Routes.Blog],
      ['footer-support-contact-route', Routes.Contact],
      ['footer-support-teachers-route', Routes.Teachers],
      ['footer-legal-routes', '3 items'],
      ['footer-cta-actions', `${Routes.Create} + ${Routes.Templates}`],
      ['footer-loop-metrics', '8 templates · Link assignments · Score results'],
      ['route-constant-boundary', 'Consistent product links'],
      ['legacy-copy-guard', 'ClassGamify navigation'],
      ['privacy-guard', 'Private data hidden'],
    ]
  );
  assertNoPrivateNavigationText(JSON.stringify(handoffView));
});

test('public navigation handoff comes from shared navbar and footer configs', () => {
  assert.deepEqual(
    getNavbarLinks().map((item) => [item.id, item.href]),
    [
      ['templates', Routes.Templates],
      ['worksheets', Routes.Worksheets],
      ['create', Routes.Create],
      ['student-preview', Routes.StudentPreview],
      ['pricing', Routes.Pricing],
      ['blog', Routes.Blog],
    ]
  );
  assert.deepEqual(
    getFooterLinks().map((section) => [
      section.id,
      section.items?.map((item) => item.id),
    ]),
    [
      [
        'product',
        ['templates', 'worksheets', 'create', 'student-preview', 'pricing'],
      ],
      ['platform', ['activities', 'assignments']],
      ['support', ['roadmap', 'articles', 'support', 'teachers']],
      ['legal', ['privacy', 'cookies', 'terms']],
    ]
  );
  assert.match(NAVBAR_SOURCE, /const menuLinks = getNavbarLinks\(\)/);
  assert.match(NAVBAR_MOBILE_SOURCE, /const menuLinks = getNavbarLinks\(\)/);
  assert.doesNotMatch(
    FOOTER_SOURCE,
    /buildPublicNavigationHandoffView|PublicNavigationHandoffPanel|data-handoff|data-handoff-item/,
    'Footer must not render internal navigation handoff markup on public pages.'
  );
  assert.match(
    NAVBAR_CONFIG_SOURCE,
    /Routes\.Templates[\s\S]*Routes\.Worksheets[\s\S]*Routes\.Create[\s\S]*Routes\.StudentPreview[\s\S]*Routes\.Pricing[\s\S]*Routes\.Blog/
  );
  assert.match(
    FOOTER_CONFIG_SOURCE,
    /Routes\.Templates[\s\S]*Routes\.Worksheets[\s\S]*Routes\.Create[\s\S]*Routes\.StudentPreview[\s\S]*Routes\.Pricing[\s\S]*Routes\.DashboardActivities[\s\S]*Routes\.DashboardAssignments[\s\S]*Routes\.Roadmap[\s\S]*Routes\.Blog[\s\S]*Routes\.Contact[\s\S]*Routes\.Teachers[\s\S]*Routes\.PrivacyPolicy[\s\S]*Routes\.CookiePolicy[\s\S]*Routes\.TermsOfService/
  );
});

test('public navigation handoff localizes Chinese entrypoint boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildPublicNavigationHandoffView();

    assert.equal(handoffView.title, '公开导航摘要');
    assert.match(handoffView.description, /公开导航摘要/);
    assert.equal(
      getHandoffValue(handoffView, 'product-loop'),
      'Activity -> Assignment -> Attempt -> Results'
    );
    assert.equal(
      getHandoffValue(handoffView, 'navbar-surface'),
      '桌面和移动端导航'
    );
    assert.equal(getHandoffValue(handoffView, 'navbar-count'), '6 个项目');
    assert.equal(
      getHandoffValue(handoffView, 'mobile-navbar-source'),
      '共享导航选择'
    );
    assert.equal(
      getHandoffValue(handoffView, 'footer-section-count'),
      '4 个项目'
    );
    assert.equal(
      getHandoffValue(handoffView, 'footer-product-section'),
      '5 个项目'
    );
    assert.equal(
      getHandoffValue(handoffView, 'footer-legal-routes'),
      '3 个项目'
    );
    assert.equal(
      getHandoffValue(handoffView, 'footer-loop-metrics'),
      '8 个模板 · 链接作业 · 得分结果'
    );
    assert.equal(
      getHandoffValue(handoffView, 'route-constant-boundary'),
      '一致的产品链接'
    );
    assert.equal(
      getHandoffValue(handoffView, 'legacy-copy-guard'),
      'ClassGamify 导航'
    );
    assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '私密数据隐藏');
    assertNoPrivateNavigationText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffValue(
  view: PublicNavigationHandoffView,
  id: PublicNavigationHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing public navigation handoff item ${id}`);
  return item.value;
}

function assertNoPrivateNavigationText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_KEY,
    SECRET_ATTEMPT_RECORD,
    SECRET_FILE_BYTES,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_CONTENT,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Public navigation handoff leaked private text: ${privateValue}`
    );
  }
}
