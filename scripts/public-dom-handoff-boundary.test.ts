import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  PUBLIC_DOM_HANDOFF_ALLOWED_ROUTE_SCOPES,
  PUBLIC_DOM_HANDOFF_BLOCKED_COMPONENT_FILES,
  PUBLIC_DOM_HANDOFF_BLOCKED_ROUTE_FILES,
  PUBLIC_DOM_HANDOFF_BOUNDARY_ITEM_IDS,
  buildPublicDomHandoffBoundaryView,
  type PublicDomHandoffBoundaryItemId,
  type PublicDomHandoffBoundaryView,
} from '@/seo/public-dom-handoff-boundary';
import { shouldRenderClassroomControlSemanticsHandoff } from '@/classroom/control-semantics';
import { Routes } from '@/lib/routes';

const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const ROOT_ROUTE_SOURCE = readFileSync('src/routes/__root.tsx', 'utf8');
const PROTECTED_PUBLIC_DOM_SOURCE_FILE_COUNT =
  PUBLIC_DOM_HANDOFF_BLOCKED_ROUTE_FILES.length +
  PUBLIC_DOM_HANDOFF_BLOCKED_COMPONENT_FILES.length;
const PUBLIC_ROUTE_INTERNAL_HANDOFF_PATTERN =
  /data-handoff|data-handoff-item|HandoffPanel|handoffView\.itemViews|<[^>]*Handoff\b/;

const SECRET_ANSWER_KEY = 'SECRET_PUBLIC_DOM_ANSWER_KEY';
const SECRET_ATTEMPT_RECORD = 'SECRET_PUBLIC_DOM_ATTEMPT_RECORD';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/public-dom.pdf';
const SECRET_STUDENT_TOKEN = 'SECRET_PUBLIC_DOM_ANONYMOUS_TOKEN';
const SECRET_TEACHER_CONTENT = 'SECRET_PUBLIC_DOM_ACTIVITY_CONTENT';

test('public DOM handoff boundary exposes 30 route and privacy slices', () => {
  const boundaryView = buildPublicDomHandoffBoundaryView();
  const itemIds = boundaryView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...PUBLIC_DOM_HANDOFF_BOUNDARY_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(boundaryView.title, 'Public DOM handoff boundary');
  assert.match(boundaryView.description, /public marketing/);
  assert.equal(
    boundaryView.itemViews.every(
      (itemView) =>
        Boolean(itemView.ariaLabel) &&
        Boolean(itemView.description) &&
        Boolean(itemView.label) &&
        Boolean(itemView.value)
    ),
    true
  );
  assert.deepEqual(boundaryView.privacy, {
    allowsAuthoringHandoffs: true,
    allowsPrintHandoffs: true,
    allowsStudentRunnerHandoffs: true,
    allowsTeacherWorkspaceHandoffs: true,
    blocksAuthPublicDomHandoffs: true,
    blocksMarketingPublicDomHandoffs: true,
    itemIds,
    keepsPublicHandoffsSourceLevel: true,
    protectsPrivateClassroomData: true,
    protectedSourceFileCount: PROTECTED_PUBLIC_DOM_SOURCE_FILE_COUNT,
    routeFiles: [...PUBLIC_DOM_HANDOFF_BLOCKED_ROUTE_FILES],
    sharedComponentFiles: [...PUBLIC_DOM_HANDOFF_BLOCKED_COMPONENT_FILES],
    scope: 'public-dom-handoff-boundary',
  });
  assertNoPrivatePublicDomBoundaryText(JSON.stringify(boundaryView));
});

test('public DOM handoff boundary summarizes public and allowed route scopes', () => {
  const boundaryView = buildPublicDomHandoffBoundaryView();

  assert.equal(PROTECTED_PUBLIC_DOM_SOURCE_FILE_COUNT, 30);
  assert.equal(PUBLIC_DOM_HANDOFF_BLOCKED_ROUTE_FILES.length, 18);
  assert.equal(PUBLIC_DOM_HANDOFF_BLOCKED_COMPONENT_FILES.length, 12);
  assert.deepEqual(
    boundaryView.itemViews.map((itemView) => [itemView.id, itemView.value]),
    [
      ['product-loop', 'Activity -> Assignment -> Attempt -> Results'],
      ['public-route-set', '30 source files'],
      ['home-route', Routes.Root],
      ['template-directory-route', Routes.Templates],
      ['worksheet-entry-route', Routes.Worksheets],
      ['pricing-route', Routes.Pricing],
      ['teachers-route', Routes.Teachers],
      ['roadmap-route', Routes.Roadmap],
      ['contact-route', Routes.Contact],
      ['blog-list-route', Routes.Blog],
      ['blog-post-route', `${Routes.Blog}/:slug`],
      ['legal-policy-routes', '3 policy routes'],
      ['auth-entry-routes', '5 auth routes'],
      ['navigation-surface', 'Navbar'],
      ['footer-surface', 'Footer'],
      ['public-view-models', 'Source-level'],
      ['source-level-contracts', 'Allowed'],
      ['public-route-dom-guard', 'Blocked'],
      ['public-handoff-markup-guard', 'Blocked'],
      ['public-handoff-panel-guard', 'Blocked'],
      ['classroom-control-route-gate', 'Create/dashboard/play/print only'],
      ['student-runner-allowed', Routes.Play],
      ['create-authoring-allowed', Routes.Create],
      ['teacher-workspace-allowed', Routes.Dashboard],
      ['print-route-allowed', '/print'],
      ['result-review-allowed', Routes.DashboardAssignmentResults],
      ['private-data-guard', 'Private data hidden'],
      ['legacy-copy-guard', 'ClassGamify only'],
      ['search-index-boundary', 'Public entry only'],
      ['privacy-guard', 'Audit DOM hidden'],
    ]
  );
  assertNoPrivatePublicDomBoundaryText(JSON.stringify(boundaryView));
});

test('shared public component sources keep internal handoff audit markup out of DOM', () => {
  const publicComponentLeaks =
    PUBLIC_DOM_HANDOFF_BLOCKED_COMPONENT_FILES.filter((filePath) => {
      assert.ok(
        existsSync(filePath),
        `Missing public component file ${filePath}`
      );
      return PUBLIC_ROUTE_INTERNAL_HANDOFF_PATTERN.test(
        readFileSync(filePath, 'utf8')
      );
    });

  assert.deepEqual(
    publicComponentLeaks,
    [],
    'Shared public navigation, entry-card, editorial, contact, and auth components must not render internal handoff audit markup.'
  );
});

test('public route sources keep internal handoff audit markup out of DOM', () => {
  const publicRouteLeaks = PUBLIC_DOM_HANDOFF_BLOCKED_ROUTE_FILES.filter(
    (filePath) => {
      assert.ok(existsSync(filePath), `Missing public route file ${filePath}`);
      return PUBLIC_ROUTE_INTERNAL_HANDOFF_PATTERN.test(
        readFileSync(filePath, 'utf8')
      );
    }
  );

  assert.deepEqual(
    publicRouteLeaks,
    [],
    'Public marketing, editorial, legal, contact, and auth routes must not render internal handoff audit markup.'
  );
});

test('classroom control handoff stays gated away from public entry routes', () => {
  for (const routePath of [
    Routes.Root,
    Routes.Templates,
    Routes.Worksheets,
    Routes.Pricing,
    Routes.Teachers,
    Routes.Roadmap,
    Routes.Contact,
    Routes.Blog,
    `${Routes.Blog}/classroom-results`,
    Routes.CookiePolicy,
    Routes.PrivacyPolicy,
    Routes.TermsOfService,
    Routes.Auth,
    Routes.Login,
    Routes.Register,
    Routes.ForgotPassword,
    Routes.ResetPassword,
    Routes.AuthError,
  ]) {
    assert.equal(
      shouldRenderClassroomControlSemanticsHandoff(routePath),
      false,
      `${routePath} should not render classroom-control handoff markup.`
    );
  }

  assert.deepEqual(PUBLIC_DOM_HANDOFF_ALLOWED_ROUTE_SCOPES, [
    Routes.Create,
    Routes.Dashboard,
    Routes.Play,
    '/print',
  ]);

  for (const routePath of [
    Routes.Create,
    Routes.DashboardActivities,
    Routes.DashboardAssignments,
    '/play/demo-food',
    '/print/assignments/example',
  ]) {
    assert.equal(
      shouldRenderClassroomControlSemanticsHandoff(routePath),
      true,
      `${routePath} should remain eligible for hidden classroom-control handoff markup.`
    );
  }
});

test('root document keeps classroom control handoff route-gated', () => {
  assert.match(
    ROOT_ROUTE_SOURCE,
    /<ClassroomControlSemanticsHandoffMount \/>/,
    'Root document should mount the route-gated classroom-control semantics boundary.'
  );
  assert.doesNotMatch(
    ROOT_ROUTE_SOURCE,
    /data-handoff|data-handoff-item/,
    'Root route source should not hardcode handoff audit attributes into every public document.'
  );
});

test('public DOM handoff boundary focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Public DOM handoff boundary has a fast script-level gate via[\s\S]*scripts\/public-dom-handoff-boundary\.test\.ts/,
    'TEST-CATALOG should document the public DOM handoff boundary gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /marketing[\s\S]*editorial[\s\S]*legal[\s\S]*contact[\s\S]*auth[\s\S]*shared public components[\s\S]*data-handoff/,
    'TEST-CATALOG should document which public surfaces must keep internal audit DOM out.'
  );
});

function getHandoffValue(
  view: PublicDomHandoffBoundaryView,
  id: PublicDomHandoffBoundaryItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing public DOM boundary handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivatePublicDomBoundaryText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_KEY,
    SECRET_ATTEMPT_RECORD,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_CONTENT,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Public DOM boundary leaked private text: ${privateValue}`
    );
  }

  assert.equal(
    getHandoffValue(buildPublicDomHandoffBoundaryView(), 'private-data-guard'),
    'Private data hidden'
  );
}
