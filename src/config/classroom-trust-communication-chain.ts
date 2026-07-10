import { Routes } from '@/lib/routes';

export const CLASSROOM_TRUST_COMMUNICATION_CHAIN_HANDOFF_ITEM_IDS = [
  'product-boundary',
  'public-contact-entry',
  'contact-classroom-intent',
  'contact-structured-fields',
  'contact-mail-context',
  'contact-no-workspace-mutation',
  'auth-entry-boundary',
  'auth-provider-gates',
  'auth-callback-safety',
  'auth-workspace-access',
  'transactional-mail-template-set',
  'transactional-mail-localization',
  'transactional-mail-boundary-panel',
  'transactional-mail-lifecycle-chain',
  'notification-teacher-updates',
  'notification-no-learner-reminders',
  'billing-hosted-boundary',
  'billing-plan-capabilities',
  'billing-provider-secret-guard',
  'legal-policy-product-model',
  'legal-provider-scope',
  'legal-student-data-boundary',
  'developer-config-deploy-owner',
  'developer-config-env-split',
  'developer-config-secret-boundary',
  'storage-source-material-boundary',
  'public-dom-handoff-boundary',
  'private-data-guard',
  'legacy-copy-guard',
  'classroom-trust-chain-gate',
] as const;

export const CLASSROOM_TRUST_COMMUNICATION_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/configuration.md',
  'docs/auth.md',
  'docs/mail.md',
  'docs/payment.md',
  'docs/storage.md',
  'src/contact/inquiry-view.ts',
  'src/contact/inquiry.ts',
  'src/routes/(pages)/contact.tsx',
  'src/api/contact.ts',
  'src/auth/workspace-boundary.ts',
  'src/auth/client.ts',
  'src/routes/auth/login.tsx',
  'src/routes/auth/register.tsx',
  'src/mail/workspace-boundary.ts',
  'src/mail/render.ts',
  'src/mail/transactional-mail-lifecycle-chain.ts',
  'src/settings/notifications-view.ts',
  'src/routes/settings/notifications.tsx',
  'src/settings/billing-view.ts',
  'src/routes/settings/billing.tsx',
  'src/payment/provider/creem.ts',
  'src/pages/legal-policy-view.ts',
  'src/routes/(legals)/privacy.tsx',
  'src/config/developer-configuration-handoff.ts',
  'src/config/website.ts',
  'wrangler.jsonc',
  '.env.example',
  'src/seo/public-dom-handoff-boundary.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ClassroomTrustCommunicationChainHandoffItemId =
  (typeof CLASSROOM_TRUST_COMMUNICATION_CHAIN_HANDOFF_ITEM_IDS)[number];

export type ClassroomTrustCommunicationChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ClassroomTrustCommunicationChainHandoffItemId;
  label: string;
  value: string;
};

export type ClassroomTrustCommunicationChainPrivacyContract = {
  chainSourceFileCount: number;
  contactCreatesActivities: false;
  contactCreatesAssignmentLinks: false;
  contactCreatesStudentRecords: false;
  exposesActionUrls: false;
  exposesAnswerKeys: false;
  exposesAuthSecrets: false;
  exposesContactMessageText: false;
  exposesOAuthClientSecrets: false;
  exposesPaymentProviderSecrets: false;
  exposesProviderApiTokens: false;
  exposesRawAnonymousTokens: false;
  exposesRawProviderErrors: false;
  exposesRecipientEmail: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesStudentIdentifiers: false;
  exposesTeacherEmail: false;
  exposesTeacherPrivateActivityContent: false;
  itemIds: ClassroomTrustCommunicationChainHandoffItemId[];
  keepsCloudflareDeployOwnerDocumented: true;
  keepsRuntimeSecretsServerSide: true;
  keepsTrustHandoffsSourceLevelForPublicDom: true;
  normalizesUnsupportedMailLocales: true;
  sendsLearnerNotifications: false;
  sourceFiles: string[];
  usesTransactionalMailLifecycleChain: true;
  usesClassGamifyProductModel: true;
};

export type ClassroomTrustCommunicationChainHandoffView = {
  description: string;
  itemViews: ClassroomTrustCommunicationChainHandoffItemView[];
  privacy: ClassroomTrustCommunicationChainPrivacyContract;
  title: string;
};

export function buildClassroomTrustCommunicationChainHandoffView(): ClassroomTrustCommunicationChainHandoffView {
  const itemViews = CLASSROOM_TRUST_COMMUNICATION_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildClassroomTrustCommunicationChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice classroom trust and communication chain from public classroom contact intake through auth, the transactional mail lifecycle, teacher notifications, hosted billing, legal/config provider boundaries, and public-DOM privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        CLASSROOM_TRUST_COMMUNICATION_CHAIN_SOURCE_FILES.length,
      contactCreatesActivities: false,
      contactCreatesAssignmentLinks: false,
      contactCreatesStudentRecords: false,
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
      exposesSourceMaterialStorageKeys: false,
      exposesStudentAttemptRecords: false,
      exposesStudentIdentifiers: false,
      exposesTeacherEmail: false,
      exposesTeacherPrivateActivityContent: false,
      itemIds: [...CLASSROOM_TRUST_COMMUNICATION_CHAIN_HANDOFF_ITEM_IDS],
      keepsCloudflareDeployOwnerDocumented: true,
      keepsRuntimeSecretsServerSide: true,
      keepsTrustHandoffsSourceLevelForPublicDom: true,
      normalizesUnsupportedMailLocales: true,
      sendsLearnerNotifications: false,
      sourceFiles: [...CLASSROOM_TRUST_COMMUNICATION_CHAIN_SOURCE_FILES],
      usesTransactionalMailLifecycleChain: true,
      usesClassGamifyProductModel: true,
    },
    title: 'Classroom trust communication chain',
  };
}

function buildClassroomTrustCommunicationChainHandoffItemView(
  id: ClassroomTrustCommunicationChainHandoffItemId
): ClassroomTrustCommunicationChainHandoffItemView {
  const item = getClassroomTrustCommunicationChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getClassroomTrustCommunicationChainHandoffItem(
  id: ClassroomTrustCommunicationChainHandoffItemId
): Omit<ClassroomTrustCommunicationChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-boundary':
      return item(
        id,
        'Product boundary',
        'Activity -> Assignment -> Attempt -> Results',
        'Trust and communication surfaces describe the ClassGamify classroom model.'
      );
    case 'public-contact-entry':
      return item(
        id,
        'Public contact entry',
        Routes.ContactClassroom,
        'Classroom inquiries start from the public contact route with classroom intent.'
      );
    case 'contact-classroom-intent':
      return item(
        id,
        'Contact classroom intent',
        'Classroom inquiry',
        'Contact intake normalizes classroom subject routing before submit.'
      );
    case 'contact-structured-fields':
      return item(
        id,
        'Contact structured fields',
        'Learners/material/routine/need',
        'Classroom context uses bounded structured fields instead of freeform student records.'
      );
    case 'contact-mail-context':
      return item(
        id,
        'Contact mail context',
        'Structured mail context',
        'Contact API rebuilds safe classroom fields for transactional email context.'
      );
    case 'contact-no-workspace-mutation':
      return item(
        id,
        'Contact mutation boundary',
        'No workspace mutation',
        'Public inquiry submission does not create activities, assignment links, or student records.'
      );
    case 'auth-entry-boundary':
      return item(
        id,
        'Auth entry boundary',
        Routes.Login,
        'Auth routes gate teacher workspace entry without exposing private classroom data.'
      );
    case 'auth-provider-gates':
      return item(
        id,
        'Auth provider gates',
        'Credential/Google gates',
        'Auth surfaces expose provider readiness without OAuth secrets.'
      );
    case 'auth-callback-safety':
      return item(
        id,
        'Auth callback safety',
        'Safe callback paths',
        'Auth redirects normalize callback paths and avoid exposing raw callback URLs.'
      );
    case 'auth-workspace-access':
      return item(
        id,
        'Auth workspace access',
        Routes.Dashboard,
        'Signed-in teachers enter dashboard, activity library, assignment links, results, and source materials.'
      );
    case 'transactional-mail-template-set':
      return item(
        id,
        'Transactional mail templates',
        'Verify/reset/newsletter/contact',
        'Mail handoffs cover the current transactional template set.'
      );
    case 'transactional-mail-localization':
      return item(
        id,
        'Transactional mail localization',
        'Localized subjects',
        'Mail rendering normalizes unsupported locales and uses localized subjects.'
      );
    case 'transactional-mail-boundary-panel':
      return item(
        id,
        'Transactional mail boundary',
        'Workspace boundary panel',
        'Email templates render shared classroom boundary context before provider send.'
      );
    case 'transactional-mail-lifecycle-chain':
      return item(
        id,
        'Transactional mail lifecycle',
        '30 mail slices',
        'The trust chain absorbs the transactional mail lifecycle for templates, locale fallback, render-before-send, providers, privacy, and no-mutation guards.'
      );
    case 'notification-teacher-updates':
      return item(
        id,
        'Teacher update settings',
        Routes.SettingsNotifications,
        'Notification settings control teacher product email updates only.'
      );
    case 'notification-no-learner-reminders':
      return item(
        id,
        'Notification learner boundary',
        'No learner reminders',
        'Teacher notification preferences do not notify students or mutate public links.'
      );
    case 'billing-hosted-boundary':
      return item(
        id,
        'Hosted billing boundary',
        Routes.SettingsBilling,
        'Billing uses hosted checkout and portal flows without raw session exposure.'
      );
    case 'billing-plan-capabilities':
      return item(
        id,
        'Billing plan capabilities',
        'Classroom loop access',
        'Plan copy stays tied to activity library, assignment workflow, AI drafts, source materials, and result review.'
      );
    case 'billing-provider-secret-guard':
      return item(
        id,
        'Billing provider secret guard',
        'Provider secrets hidden',
        'Payment provider keys and raw checkout sessions stay server-side.'
      );
    case 'legal-policy-product-model':
      return item(
        id,
        'Legal policy product model',
        'Teacher/student data model',
        'Legal pages describe activities, public assignment links, attempts, results, and AI drafts.'
      );
    case 'legal-provider-scope':
      return item(
        id,
        'Legal provider scope',
        'Configured providers',
        'Legal policy copy names current auth, payment, storage, analytics, and classroom AI provider scopes.'
      );
    case 'legal-student-data-boundary':
      return item(
        id,
        'Legal student data boundary',
        'Student data protected',
        'Legal handoffs keep answer keys, anonymous tokens, and attempt records out of public audit payloads.'
      );
    case 'developer-config-deploy-owner':
      return item(
        id,
        'Deploy owner boundary',
        'Cloudflare Git',
        'Developer configuration documents Cloudflare as production deploy owner.'
      );
    case 'developer-config-env-split':
      return item(
        id,
        'Environment split',
        'Build/runtime split',
        'Configuration separates public VITE build-time values from Worker runtime secrets.'
      );
    case 'developer-config-secret-boundary':
      return item(
        id,
        'Runtime secret boundary',
        'Worker secrets',
        'OAuth, mail, payment, webhook, and AI provider keys stay in Worker secrets.'
      );
    case 'storage-source-material-boundary':
      return item(
        id,
        'Storage source-material boundary',
        'R2 owner files',
        'Storage documentation and config keep teacher source materials owner-scoped and out of student payloads.'
      );
    case 'public-dom-handoff-boundary':
      return item(
        id,
        'Public DOM handoff boundary',
        'Source-level public gates',
        'Public contact, auth, legal, and marketing routes do not render internal data-handoff audit output.'
      );
    case 'private-data-guard':
      return item(
        id,
        'Private data guard',
        'Private data hidden',
        'The trust chain omits provider tokens, secrets, student identifiers, raw tokens, source storage keys, and private activity content.'
      );
    case 'legacy-copy-guard':
      return item(
        id,
        'Legacy copy guard',
        'ClassGamify only',
        'Trust, mail, legal, and configuration surfaces avoid inherited learning-site or image-generation provider copy.'
      );
    case 'classroom-trust-chain-gate':
      return item(
        id,
        'Classroom trust chain gate',
        '30 source files',
        'A focused gate keeps public contact, auth, mail, notifications, billing, legal, config, storage, and public-DOM boundaries aligned.'
      );
  }
}

function item(
  id: ClassroomTrustCommunicationChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<ClassroomTrustCommunicationChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
