import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVE_SURFACE_ALLOWED_LEGACY_MIGRATION_FILES,
  ACTIVE_SURFACE_PRODUCT_BOUNDARY_ITEM_IDS,
  ACTIVE_SURFACE_PRODUCT_BOUNDARY_SOURCE_FILES,
  buildActiveSurfaceProductBoundaryView,
  type ActiveSurfaceProductBoundaryItemId,
  type ActiveSurfaceProductBoundaryView,
} from '@/config/active-surface-product-boundary';
import { AUTH_WORKSPACE_HANDOFF_ITEM_IDS } from '@/auth/workspace-boundary';
import { CONTACT_CLASSROOM_INTAKE_HANDOFF_ITEM_IDS } from '@/contact/inquiry-view';
import { DEVELOPER_CONFIGURATION_HANDOFF_ITEM_IDS } from '@/config/developer-configuration-handoff';
import { MAIL_TRANSACTIONAL_WORKSPACE_HANDOFF_ITEM_IDS } from '@/mail/workspace-boundary';
import { SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS } from '@/settings/account-handoff';
import { SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS } from '@/settings/billing-view';
import { SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS } from '@/settings/notifications-view';

const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const SECRET_CHECKOUT_SESSION = 'checkout-session-secret';
const SECRET_PROVIDER_KEY = 'sk_live_payment_provider_secret';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_ANSWER = 'student private answer';
const SECRET_STUDENT_TOKEN = 'anonymous-browser-token';
const SECRET_TEACHER_EMAIL = 'teacher-private@example.test';

const LEGACY_COPY_PATTERN =
  /mksaas|getlangstudy|Lang Study|Hanzi|HSK|TanStarter|MyApp/i;
const UNUSED_PROVIDER_COPY_PATTERN =
  /fal\.ai|AI image generation|image generation provider/i;

test('active surface product boundary exposes 30 current-surface slices', () => {
  const boundaryView = buildActiveSurfaceProductBoundaryView();
  const itemIds = boundaryView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...ACTIVE_SURFACE_PRODUCT_BOUNDARY_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(boundaryView.title, 'Active surface product boundary');
  assert.match(boundaryView.description, /account, contact, billing/);
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
    activeSourceFileCount: ACTIVE_SURFACE_PRODUCT_BOUNDARY_SOURCE_FILES.length,
    allowsLegacyMigrationCopyOnlyIn: [
      ...ACTIVE_SURFACE_ALLOWED_LEGACY_MIGRATION_FILES,
    ],
    currentSurfacesUseClassGamifyCopy: true,
    exposesProviderSecrets: false,
    exposesRawCheckoutSessions: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswers: false,
    exposesStudentIdentifiers: false,
    exposesTeacherEmail: false,
    itemIds,
    keepsCurrentFormsProductScoped: true,
    keepsDeveloperExamplesProductScoped: true,
    keepsProviderCopyOut: true,
    protectsClassroomProductLoop: true,
    sourceFiles: [...ACTIVE_SURFACE_PRODUCT_BOUNDARY_SOURCE_FILES],
  });
  assertNoPrivateActiveSurfaceText(JSON.stringify(boundaryView));
});

test('active surface product boundary summarizes current account and configuration surfaces', () => {
  const boundaryView = buildActiveSurfaceProductBoundaryView();

  assert.equal(ACTIVE_SURFACE_PRODUCT_BOUNDARY_SOURCE_FILES.length, 30);
  assert.deepEqual(
    boundaryView.itemViews.map((itemView) => [itemView.id, itemView.value]),
    [
      ['developer-configuration', '30 configuration slices'],
      ['env-example-origin', 'https://classgamify.example'],
      ['env-secret-placeholders', 'Blank placeholders'],
      ['auth-entry-copy', 'Teacher workspace'],
      [
        'auth-workspace-boundary',
        'Account -> Activities -> Assignments -> Results',
      ],
      ['contact-form-copy', 'Classroom inquiry'],
      ['contact-classroom-intake', '30 intake slices'],
      ['contact-email-routing', 'Structured contact email'],
      ['profile-settings-copy', 'Teacher identity'],
      ['security-settings-copy', 'Workspace access'],
      ['account-settings-handoff', '30 account slices'],
      ['notification-settings-copy', 'Classroom updates'],
      ['notification-update-handoff', '30 update slices'],
      ['billing-settings-copy', 'Plan access'],
      ['billing-workspace-handoff', '30 billing slices'],
      ['payment-callback-copy', '/settings/payment'],
      ['hosted-billing-boundary', 'Hosted checkout and portal'],
      [
        'mail-workspace-boundary',
        'Activities, assignments, results, AI sources',
      ],
      ['mail-template-copy', 'ClassGamify transactional mail'],
      ['newsletter-settings-copy', 'Teacher product email'],
      ['configuration-docs', 'Cloudflare-owned deploy path'],
      ['auth-docs', 'Teacher workspace secrets'],
      ['mail-docs', 'Transactional workspace'],
      ['payment-docs', 'Classroom capability boundary'],
      ['newsletter-docs', 'Logged-in settings card'],
      ['storage-docs', 'Source-material privacy'],
      ['website-config-sender', 'ClassGamify support sender'],
      ['worker-config-bindings', 'DB and BUCKET'],
      ['legacy-copy-guard', 'Current surfaces: ClassGamify only'],
      ['provider-copy-guard', 'No unused provider copy'],
    ]
  );
  assertNoPrivateActiveSurfaceText(JSON.stringify(boundaryView));
});

test('active surface source inventory stays tied to existing 30-slice focused contracts', () => {
  const focusedContractLengths = new Map<string, number>([
    ['auth', AUTH_WORKSPACE_HANDOFF_ITEM_IDS.length],
    ['contact', CONTACT_CLASSROOM_INTAKE_HANDOFF_ITEM_IDS.length],
    ['developer-config', DEVELOPER_CONFIGURATION_HANDOFF_ITEM_IDS.length],
    ['mail', MAIL_TRANSACTIONAL_WORKSPACE_HANDOFF_ITEM_IDS.length],
    ['settings-account', SETTINGS_ACCOUNT_WORKSPACE_HANDOFF_ITEM_IDS.length],
    ['settings-billing', SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS.length],
    [
      'settings-notifications',
      SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS.length,
    ],
  ]);

  assert.deepEqual(
    [...focusedContractLengths.values()],
    [30, 30, 30, 30, 30, 30, 30]
  );

  for (const filePath of ACTIVE_SURFACE_PRODUCT_BOUNDARY_SOURCE_FILES) {
    assert.ok(existsSync(filePath), `Missing active surface file ${filePath}`);
  }
});

test('current active account, contact, billing, mail, and config sources keep legacy copy out', () => {
  const legacyLeaks = ACTIVE_SURFACE_PRODUCT_BOUNDARY_SOURCE_FILES.filter(
    (filePath) =>
      !ACTIVE_SURFACE_ALLOWED_LEGACY_MIGRATION_FILES.includes(
        filePath as (typeof ACTIVE_SURFACE_ALLOWED_LEGACY_MIGRATION_FILES)[number]
      ) && LEGACY_COPY_PATTERN.test(readFileSync(filePath, 'utf8'))
  );

  assert.deepEqual(
    legacyLeaks,
    [],
    'Current active forms, billing pages, mail templates, docs, and configuration examples should not reintroduce copied learning-site or starter names.'
  );
});

test('current active sources keep unused provider copy out of the product model', () => {
  const providerCopyLeaks = ACTIVE_SURFACE_PRODUCT_BOUNDARY_SOURCE_FILES.filter(
    (filePath) =>
      UNUSED_PROVIDER_COPY_PATTERN.test(readFileSync(filePath, 'utf8'))
  );

  assert.deepEqual(
    providerCopyLeaks,
    [],
    'Active account, contact, billing, mail, notification, and configuration surfaces must not describe unused image-generation provider copy.'
  );
});

test('active surface focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Active surface product boundary has a fast script-level gate via[\s\S]*scripts\/active-surface-product-boundary\.test\.ts/,
    'TEST-CATALOG should document the active surface product boundary gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /account[\s\S]*contact[\s\S]*billing[\s\S]*mail[\s\S]*notification[\s\S]*developer configuration[\s\S]*ClassGamify terms/,
    'TEST-CATALOG should document the active account/contact/billing/mail/notification/configuration boundary scope.'
  );
});

function getHandoffValue(
  view: ActiveSurfaceProductBoundaryView,
  id: ActiveSurfaceProductBoundaryItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing active surface boundary item ${id}`);
  return itemView.value;
}

function assertNoPrivateActiveSurfaceText(serializedView: string) {
  for (const privateValue of [
    SECRET_CHECKOUT_SESSION,
    SECRET_PROVIDER_KEY,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_EMAIL,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Active surface boundary leaked private text: ${privateValue}`
    );
  }

  assert.equal(
    getHandoffValue(
      buildActiveSurfaceProductBoundaryView(),
      'legacy-copy-guard'
    ),
    'Current surfaces: ClassGamify only'
  );
}
