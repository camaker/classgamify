import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { AUTH_WORKSPACE_HANDOFF_ITEM_IDS } from '@/auth/workspace-boundary';
import {
  CLASSROOM_TRUST_COMMUNICATION_CHAIN_HANDOFF_ITEM_IDS,
  CLASSROOM_TRUST_COMMUNICATION_CHAIN_SOURCE_FILES,
  buildClassroomTrustCommunicationChainHandoffView,
  type ClassroomTrustCommunicationChainHandoffItemId,
  type ClassroomTrustCommunicationChainHandoffView,
} from '@/config/classroom-trust-communication-chain';
import { DEVELOPER_CONFIGURATION_HANDOFF_ITEM_IDS } from '@/config/developer-configuration-handoff';
import { CONTACT_CLASSROOM_INTAKE_HANDOFF_ITEM_IDS } from '@/contact/inquiry-view';
import { Routes } from '@/lib/routes';
import { MAIL_TRANSACTIONAL_WORKSPACE_HANDOFF_ITEM_IDS } from '@/mail/workspace-boundary';
import {
  TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_SOURCE_FILES,
} from '@/mail/transactional-mail-lifecycle-chain';
import { LEGAL_POLICY_HANDOFF_ITEM_IDS } from '@/pages/legal-policy-view';
import { PUBLIC_DOM_HANDOFF_BOUNDARY_ITEM_IDS } from '@/seo/public-dom-handoff-boundary';
import { SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS } from '@/settings/billing-view';
import { SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS } from '@/settings/notifications-view';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const CONFIGURATION_DOC_SOURCE = readFileSync('docs/configuration.md', 'utf8');
const AUTH_DOC_SOURCE = readFileSync('docs/auth.md', 'utf8');
const MAIL_DOC_SOURCE = readFileSync('docs/mail.md', 'utf8');
const PAYMENT_DOC_SOURCE = readFileSync('docs/payment.md', 'utf8');
const STORAGE_DOC_SOURCE = readFileSync('docs/storage.md', 'utf8');
const CONTACT_INTAKE_SOURCE = readFileSync(
  'src/contact/inquiry-view.ts',
  'utf8'
);
const AUTH_WORKSPACE_SOURCE = readFileSync(
  'src/auth/workspace-boundary.ts',
  'utf8'
);
const MAIL_WORKSPACE_SOURCE = readFileSync(
  'src/mail/workspace-boundary.ts',
  'utf8'
);
const TRANSACTIONAL_MAIL_LIFECYCLE_SOURCE = readFileSync(
  'src/mail/transactional-mail-lifecycle-chain.ts',
  'utf8'
);
const NOTIFICATION_SOURCE = readFileSync(
  'src/settings/notifications-view.ts',
  'utf8'
);
const BILLING_SOURCE = readFileSync('src/settings/billing-view.ts', 'utf8');
const LEGAL_POLICY_SOURCE = readFileSync(
  'src/pages/legal-policy-view.ts',
  'utf8'
);
const DEVELOPER_CONFIG_SOURCE = readFileSync(
  'src/config/developer-configuration-handoff.ts',
  'utf8'
);
const PUBLIC_DOM_BOUNDARY_SOURCE = readFileSync(
  'src/seo/public-dom-handoff-boundary.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ACTION_URL = 'https://classgamify.example/private-reset-token';
const PRIVATE_ANSWER_KEY = 'SECRET_TRUST_CHAIN_ANSWER_KEY';
const PRIVATE_AUTH_SECRET = 'SECRET_TRUST_CHAIN_AUTH_SECRET';
const PRIVATE_CONTACT_MESSAGE = 'SECRET_TRUST_CHAIN_CONTACT_MESSAGE';
const PRIVATE_OAUTH_SECRET = 'SECRET_TRUST_CHAIN_OAUTH_SECRET';
const PRIVATE_PAYMENT_SECRET = 'SECRET_TRUST_CHAIN_PAYMENT_SECRET';
const PRIVATE_PROVIDER_ERROR = 'SECRET_TRUST_CHAIN_PROVIDER_ERROR';
const PRIVATE_PROVIDER_TOKEN = 'SECRET_TRUST_CHAIN_PROVIDER_TOKEN';
const PRIVATE_RECIPIENT_EMAIL = 'trust-chain-recipient@example.test';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/trust-chain.pdf';
const PRIVATE_STUDENT_ATTEMPT = 'SECRET_TRUST_CHAIN_STUDENT_ATTEMPT';
const PRIVATE_STUDENT_IDENTIFIER = 'SECRET_TRUST_CHAIN_STUDENT_IDENTIFIER';
const PRIVATE_STUDENT_TOKEN = 'SECRET_TRUST_CHAIN_RAW_STUDENT_TOKEN';
const PRIVATE_TEACHER_EMAIL = 'trust-chain-teacher@example.test';
const PRIVATE_TEACHER_CONTENT = 'SECRET_TRUST_CHAIN_TEACHER_ACTIVITY_CONTENT';

test('classroom trust communication chain exposes 30 safe trust slices', () => {
  const handoffView = buildClassroomTrustCommunicationChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...CLASSROOM_TRUST_COMMUNICATION_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Classroom trust communication chain');
  assert.match(
    handoffView.description,
    /Thirty-slice classroom trust and communication chain/
  );
  assert.equal(handoffView.itemViews.length, 30);
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
    chainSourceFileCount:
      CLASSROOM_TRUST_COMMUNICATION_CHAIN_SOURCE_FILES.length,
    contactCreatesActivities: false,
    contactCreatesAssignmentLinks: false,
    contactCreatesStudentRecords: false,
    exportsResultRecords: false,
    exposesActionUrls: false,
    exposesAnswerKeys: false,
    exposesAuthSecrets: false,
    exposesContactMessageText: false,
    exposesOAuthClientSecrets: false,
    exposesPaymentProviderSecrets: false,
    exposesProviderApiTokens: false,
    exposesRawAnonymousTokens: false,
    exposesRawProviderErrors: false,
    exposesRecipientEmail: false,
    exposesRecipientName: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesStudentIdentifiers: false,
    exposesTeacherEmail: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds,
    keepsCloudflareDeployOwnerDocumented: true,
    keepsRuntimeSecretsServerSide: true,
    keepsTrustHandoffsSourceLevelForPublicDom: true,
    normalizesUnsupportedMailLocales: true,
    mutatesActivities: false,
    mutatesAssignmentLinks: false,
    mutatesAttemptRecords: false,
    readsSourceMaterialFileBytes: false,
    rendersBeforeProviderSend: true,
    rendersSharedMailBoundaryPanel: true,
    sendsLearnerNotifications: false,
    sourceFiles: [...CLASSROOM_TRUST_COMMUNICATION_CHAIN_SOURCE_FILES],
    usesLocalizedMailSubjects: true,
    usesMailProviderRegistryBoundary: true,
    usesTransactionalMailWorkspaceHandoff: true,
    usesTransactionalMailLifecycleChain: true,
    usesClassGamifyProductModel: true,
  });
  assertNoPrivateClassroomTrustText(JSON.stringify(handoffView));
});

test('classroom trust communication chain summarizes contact through configuration flow', () => {
  const handoffView = buildClassroomTrustCommunicationChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-boundary', 'Activity -> Assignment -> Attempt -> Results'],
      ['public-contact-entry', Routes.ContactClassroom],
      ['contact-classroom-intent', 'Classroom inquiry'],
      ['contact-structured-fields', 'Learners/material/routine/need'],
      ['contact-mail-context', 'Structured mail context'],
      ['contact-no-workspace-mutation', 'No workspace mutation'],
      ['auth-entry-boundary', Routes.Login],
      ['auth-provider-gates', 'Credential/Google gates'],
      ['auth-callback-safety', 'Safe callback paths'],
      ['auth-workspace-access', Routes.Dashboard],
      ['transactional-mail-template-set', 'Verify/reset/newsletter/contact'],
      ['transactional-mail-localization', 'Localized subjects'],
      ['transactional-mail-boundary-panel', 'Workspace boundary panel'],
      ['transactional-mail-lifecycle-chain', '30 mail slices'],
      ['notification-teacher-updates', Routes.SettingsNotifications],
      ['notification-no-learner-reminders', 'No learner reminders'],
      ['billing-hosted-boundary', Routes.SettingsBilling],
      ['billing-plan-capabilities', 'Classroom loop access'],
      ['billing-provider-secret-guard', 'Provider secrets hidden'],
      ['legal-policy-product-model', 'Teacher/student data model'],
      ['legal-provider-scope', 'Configured providers'],
      ['legal-student-data-boundary', 'Student data protected'],
      ['developer-config-deploy-owner', 'Cloudflare Git'],
      ['developer-config-env-split', 'Build/runtime split'],
      ['developer-config-secret-boundary', 'Worker secrets'],
      ['storage-source-material-boundary', 'R2 owner files'],
      ['public-dom-handoff-boundary', 'Source-level public gates'],
      ['private-data-guard', 'Private data hidden'],
      ['legacy-copy-guard', 'ClassGamify only'],
      ['transactional-mail-workspace-boundary', '30 mail handoff slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-contact-entry'),
    Routes.ContactClassroom
  );
  assert.equal(
    getHandoffValue(handoffView, 'auth-entry-boundary'),
    Routes.Login
  );
  assert.equal(
    getHandoffValue(handoffView, 'billing-hosted-boundary'),
    Routes.SettingsBilling
  );
});

test('classroom trust communication chain is backed by focused trust gates', () => {
  assert.equal(CLASSROOM_TRUST_COMMUNICATION_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of CLASSROOM_TRUST_COMMUNICATION_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing classroom trust communication chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      CONTACT_CLASSROOM_INTAKE_HANDOFF_ITEM_IDS.length,
      AUTH_WORKSPACE_HANDOFF_ITEM_IDS.length,
      TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      MAIL_TRANSACTIONAL_WORKSPACE_HANDOFF_ITEM_IDS.length,
      SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS.length,
      SETTINGS_BILLING_WORKSPACE_HANDOFF_ITEM_IDS.length,
      LEGAL_POLICY_HANDOFF_ITEM_IDS.length,
      DEVELOPER_CONFIGURATION_HANDOFF_ITEM_IDS.length,
      PUBLIC_DOM_HANDOFF_BOUNDARY_ITEM_IDS.length,
    ],
    Array.from({ length: 9 }, () => 30)
  );
  assert.equal(TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_SOURCE_FILES.length, 30);
});

test('classroom trust communication chain preserves product-doc trust boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /account\/contact copy[\s\S]*current forms, billing pages, and[\s\S]*configuration examples should speak in ClassGamify terms/i,
    'docs/product.md should keep account, contact, billing, and configuration copy on ClassGamify terms.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Public policy pages[\s\S]*ClassGamify's teacher activity, public assignment link, student[\s\S]*attempt, results, and AI-draft data model/i,
    'docs/product.md should keep legal policy pages tied to the classroom data model.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Legal provider examples should stay tied to configured classroom AI providers[\s\S]*teacher-reviewed activity\/worksheet workflows/i,
    'docs/product.md should keep provider copy tied to configured classroom workflows.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Public template directories, worksheet entry pages, marketing pages,[\s\S]*should not render internal `data-handoff`[\s\S]*audit output into public DOM/i,
    'docs/product.md should keep public trust handoffs source-level.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Teacher-uploaded audio, worksheet images, worksheet documents, or spreadsheets[\s\S]*student payloads still expose only sanitized runtime prompts and choices,[\s\S]*not[\s\S]*storage keys/i,
    'docs/product.md should keep source-material storage details out of student payloads.'
  );
});

test('classroom trust communication sources preserve privacy and mutation boundaries', () => {
  assert.match(
    CONTACT_INTAKE_SOURCE,
    /createsActivities: false[\s\S]*createsAssignmentLinks: false[\s\S]*createsStudentRecords: false[\s\S]*mutatesTeacherWorkspace: false[\s\S]*notifiesLearners: false/,
    'Contact intake should collect classroom context without mutating workspace or notifying learners.'
  );
  assert.match(
    AUTH_WORKSPACE_SOURCE,
    /createsAssignmentLinks: false[\s\S]*exposesAuthSecrets: false[\s\S]*exposesCallbackUrl: false[\s\S]*exposesOAuthClientSecret: false[\s\S]*requiresTeacherSessionForWorkspace: true[\s\S]*usesSafeCallbackPaths: true/,
    'Auth workspace handoff should protect auth secrets and callback safety.'
  );
  assert.match(
    MAIL_WORKSPACE_SOURCE,
    /exposesActionUrls: false[\s\S]*exposesContactMessageText: false[\s\S]*exposesProviderApiTokens: false[\s\S]*normalizesUnsupportedLocales: true[\s\S]*rendersBeforeProviderSend: true[\s\S]*sendsLearnerNotifications: false/,
    'Transactional mail handoff should render safe localized boundaries before provider send.'
  );
  assert.match(
    TRANSACTIONAL_MAIL_LIFECYCLE_SOURCE,
    /TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS[\s\S]*'template-set-registry'[\s\S]*'render-before-send'[\s\S]*'provider-registry'[\s\S]*'no-workspace-mutation'[\s\S]*'learner-notification-guard'/,
    'Classroom trust chain should absorb the full transactional mail lifecycle contract.'
  );
  assert.match(
    NOTIFICATION_SOURCE,
    /changesActivityContent: false[\s\S]*changesAssignmentSnapshots: false[\s\S]*changesAttemptRecords: false[\s\S]*notifiesLearners: false[\s\S]*sendsStudentAssignmentReminders: false[\s\S]*updatesTeacherProductEmailOnly: true/,
    'Notification settings should remain teacher product-email preferences.'
  );
  assert.match(
    BILLING_SOURCE,
    /changesActivityContent: false[\s\S]*changesAssignmentLinks: false[\s\S]*exposesPaymentProviderSecrets: false[\s\S]*exposesRawCheckoutSession: false[\s\S]*hostedBillingOnly: true/,
    'Billing settings should stay hosted and avoid classroom data mutation.'
  );
  assert.match(
    LEGAL_POLICY_SOURCE,
    /describesAiDraftDataModel: true[\s\S]*describesPublicAssignmentLinks: true[\s\S]*describesStudentAttempts: true[\s\S]*describesTeacherActivities: true[\s\S]*keepsLegacyCopyOut: true/,
    'Legal policy handoff should describe the ClassGamify classroom data model.'
  );
  assert.match(
    DEVELOPER_CONFIG_SOURCE,
    /documentsCloudflareDeployOwnership: true[\s\S]*documentsRuntimeSecrets: true[\s\S]*exposesProviderApiTokens: false[\s\S]*keepsE2eHelpersLocal: true[\s\S]*usesWorkerBindingsForData: true/,
    'Developer configuration handoff should keep deploy ownership and secret boundaries explicit.'
  );
  assert.match(
    PUBLIC_DOM_BOUNDARY_SOURCE,
    /public marketing, editorial, legal, contact, and auth route DOM/i,
    'Public DOM boundary should cover public contact, auth, legal, and marketing trust routes.'
  );
});

test('classroom trust communication docs preserve provider and env boundaries', () => {
  assert.match(
    CONFIGURATION_DOC_SOURCE,
    /Cloudflare Git integration owns production builds and deploys[\s\S]*Worker runtime secrets belong in Cloudflare Worker secrets/i,
    'Configuration docs should keep Cloudflare deploy ownership and runtime secrets explicit.'
  );
  assert.match(
    AUTH_DOC_SOURCE,
    /teacher workspace[\s\S]*saved\s+activities[\s\S]*assignment links[\s\S]*source materials[\s\S]*attempts[\s\S]*results/i,
    'Auth docs should describe workspace access in ClassGamify terms.'
  );
  assert.match(
    MAIL_DOC_SOURCE,
    /workspace-boundary\.ts[\s\S]*saved activities[\s\S]*assignment links[\s\S]*student attempts\/results[\s\S]*teacher-reviewed AI drafts[\s\S]*source-material/i,
    'Mail docs should keep transactional mail tied to classroom workspace boundaries.'
  );
  assert.match(
    PAYMENT_DOC_SOURCE,
    /activity creation[\s\S]*assignment publishing[\s\S]*AI drafts[\s\S]*source\s+materials[\s\S]*result review/i,
    'Payment docs should describe classroom plan capabilities.'
  );
  assert.match(
    STORAGE_DOC_SOURCE,
    /Student assignment payloads[\s\S]*they do not expose[\s\S]*source-material[\s\S]*storage keys/i,
    'Storage docs should keep source-material keys out of student payloads.'
  );
});

test('classroom trust communication chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Classroom trust communication chain has a fast script-level gate via[\s\S]*scripts\/classroom-trust-communication-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the classroom trust communication chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /public classroom contact intake[\s\S]*auth workspace entry[\s\S]*transactional mail lifecycle[\s\S]*teacher notification settings[\s\S]*hosted billing[\s\S]*legal\/provider copy[\s\S]*developer configuration secrets[\s\S]*public DOM handoff boundaries/,
    'TEST-CATALOG should describe the full classroom trust communication chain scope.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /transactional mail workspace boundary/,
    'TEST-CATALOG should document the concrete transactional mail workspace boundary.'
  );
});

function getHandoffValue(
  view: ClassroomTrustCommunicationChainHandoffView,
  id: ClassroomTrustCommunicationChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing classroom trust communication chain item ${id}`);
  return item.value;
}

function assertNoPrivateClassroomTrustText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACTION_URL,
    PRIVATE_ANSWER_KEY,
    PRIVATE_AUTH_SECRET,
    PRIVATE_CONTACT_MESSAGE,
    PRIVATE_OAUTH_SECRET,
    PRIVATE_PAYMENT_SECRET,
    PRIVATE_PROVIDER_ERROR,
    PRIVATE_PROVIDER_TOKEN,
    PRIVATE_RECIPIENT_EMAIL,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_ATTEMPT,
    PRIVATE_STUDENT_IDENTIFIER,
    PRIVATE_STUDENT_TOKEN,
    PRIVATE_TEACHER_EMAIL,
    PRIVATE_TEACHER_CONTENT,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Classroom trust communication chain leaked private text: ${privateValue}`
    );
  }
}
