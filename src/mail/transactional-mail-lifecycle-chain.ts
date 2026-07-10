export const TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS = [
  'product-mail-boundary',
  'mail-doc-provider-registry',
  'template-type-union',
  'template-set-registry',
  'locale-normalization',
  'subject-localization',
  'html-render-path',
  'plain-text-render-path',
  'render-before-send',
  'shared-email-layout',
  'workspace-boundary-panel',
  'boundary-activities-scope',
  'boundary-assignments-scope',
  'boundary-results-scope',
  'boundary-ai-source-scope',
  'verify-email-consumer',
  'forgot-password-consumer',
  'newsletter-consumer',
  'contact-consumer',
  'contact-structured-fields',
  'provider-registry',
  'resend-template-render',
  'cloudflare-template-render',
  'mail-disabled-guard',
  'provider-secret-guard',
  'action-url-guard',
  'recipient-privacy-guard',
  'no-workspace-mutation',
  'learner-notification-guard',
  'transactional-mail-chain-gate',
] as const;

export const TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/mail.md',
  'docs/configuration.md',
  'docs/auth.md',
  'src/mail/types.ts',
  'src/mail/locale.ts',
  'src/mail/render.ts',
  'src/mail/index.ts',
  'src/mail/workspace-boundary.ts',
  'src/mail/components/email-layout.tsx',
  'src/mail/components/email-workspace-boundary.tsx',
  'src/mail/components/email-button.tsx',
  'src/mail/templates/verify-email.tsx',
  'src/mail/templates/forgot-password.tsx',
  'src/mail/templates/subscribe-newsletter.tsx',
  'src/mail/templates/contact-message.tsx',
  'src/mail/provider/resend.ts',
  'src/mail/provider/cloudflare.ts',
  'src/auth/auth.ts',
  'src/api/contact.ts',
  'src/api/newsletter.ts',
  'src/newsletter/index.ts',
  'src/components/settings/notification/newsletter-form-card.tsx',
  'src/settings/notifications-view.ts',
  'src/routes/settings/notifications.tsx',
  'src/routes/(pages)/contact.tsx',
  'src/contact/inquiry.ts',
  'src/contact/inquiry-view.ts',
  'scripts/mail-transactional-workspace-handoff-semantic-views.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type TransactionalMailLifecycleChainHandoffItemId =
  (typeof TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type TransactionalMailLifecycleChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: TransactionalMailLifecycleChainHandoffItemId;
  label: string;
  value: string;
};

export type TransactionalMailLifecycleChainPrivacyContract = {
  chainSourceFileCount: number;
  contactCreatesActivities: false;
  contactCreatesAssignmentLinks: false;
  contactCreatesStudentRecords: false;
  exposesActionUrls: false;
  exposesContactMessageText: false;
  exposesProviderApiTokens: false;
  exposesRawProviderErrors: false;
  exposesRecipientEmails: false;
  exposesRecipientNames: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentIdentifiers: false;
  itemIds: TransactionalMailLifecycleChainHandoffItemId[];
  mutatesActivities: false;
  mutatesAssignmentLinks: false;
  mutatesAttemptRecords: false;
  normalizesUnsupportedLocales: true;
  readsSourceMaterialFileBytes: false;
  rendersBeforeProviderSend: true;
  rendersSharedWorkspaceBoundary: true;
  sendsLearnerNotifications: false;
  sourceFiles: string[];
  templateSetSize: number;
  usesProviderRegistry: true;
};

export type TransactionalMailLifecycleChainHandoffView = {
  description: string;
  itemViews: TransactionalMailLifecycleChainHandoffItemView[];
  privacy: TransactionalMailLifecycleChainPrivacyContract;
  title: string;
};

export function buildTransactionalMailLifecycleChainHandoffView(): TransactionalMailLifecycleChainHandoffView {
  const itemViews = TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildTransactionalMailLifecycleChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice transactional mail lifecycle chain from ClassGamify product boundaries and localized template rendering through auth, newsletter, contact, provider, workspace-boundary, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      contactCreatesActivities: false,
      contactCreatesAssignmentLinks: false,
      contactCreatesStudentRecords: false,
      exposesActionUrls: false,
      exposesContactMessageText: false,
      exposesProviderApiTokens: false,
      exposesRawProviderErrors: false,
      exposesRecipientEmails: false,
      exposesRecipientNames: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentIdentifiers: false,
      itemIds: [...TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS],
      mutatesActivities: false,
      mutatesAssignmentLinks: false,
      mutatesAttemptRecords: false,
      normalizesUnsupportedLocales: true,
      readsSourceMaterialFileBytes: false,
      rendersBeforeProviderSend: true,
      rendersSharedWorkspaceBoundary: true,
      sendsLearnerNotifications: false,
      sourceFiles: [...TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_SOURCE_FILES],
      templateSetSize: 4,
      usesProviderRegistry: true,
    },
    title: 'Transactional mail lifecycle chain',
  };
}

function buildTransactionalMailLifecycleChainHandoffItemView(
  id: TransactionalMailLifecycleChainHandoffItemId
): TransactionalMailLifecycleChainHandoffItemView {
  const item = getTransactionalMailLifecycleChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getTransactionalMailLifecycleChainHandoffItem(
  id: TransactionalMailLifecycleChainHandoffItemId
): Omit<TransactionalMailLifecycleChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-mail-boundary':
      return item(
        id,
        'Product mail boundary',
        'Teacher workspace',
        'Transactional email copy stays tied to saved activities, assignment links, student attempts, result records, AI drafts, and source materials.'
      );
    case 'mail-doc-provider-registry':
      return item(
        id,
        'Mail documentation',
        'Provider registry',
        'Mail docs describe provider registration, render-before-send behavior, locale fallback, and shared workspace-boundary panels.'
      );
    case 'template-type-union':
      return item(
        id,
        'Template type union',
        '4 templates',
        'The EmailTemplate union covers verify-email, forgot-password, subscribe-newsletter, and contact-message flows.'
      );
    case 'template-set-registry':
      return item(
        id,
        'Template set registry',
        'Render registry',
        'The render module maps every transactional template id to a React email template.'
      );
    case 'locale-normalization':
      return item(
        id,
        'Locale normalization',
        'Base fallback',
        'Unsupported or missing mail locales fall back through the mail locale helper before subjects and HTML render.'
      );
    case 'subject-localization':
      return item(
        id,
        'Subject localization',
        'Message keys',
        'Transactional subjects resolve from localized message keys rather than hardcoded copied starter copy.'
      );
    case 'html-render-path':
      return item(
        id,
        'HTML render path',
        'React email',
        'Templates render through React email HTML before providers receive a payload.'
      );
    case 'plain-text-render-path':
      return item(
        id,
        'Plain-text render path',
        'HTML to text',
        'Plain-text email bodies derive from the same rendered HTML and decode common entities.'
      );
    case 'render-before-send':
      return item(
        id,
        'Render before send',
        'Prepared payload',
        'Template sends prepare subject, HTML, and text before either provider sends mail.'
      );
    case 'shared-email-layout':
      return item(
        id,
        'Shared email layout',
        'Localized HTML',
        'The shared layout sets the normalized HTML language and ClassGamify footer copy.'
      );
    case 'workspace-boundary-panel':
      return item(
        id,
        'Workspace boundary panel',
        'Shared panel',
        'Every transactional template renders the shared workspace boundary panel before action links or provider send.'
      );
    case 'boundary-activities-scope':
      return item(
        id,
        'Activities boundary',
        'Activities/templates',
        'Email boundary copy explains saved activities, templates, and source-material workflows.'
      );
    case 'boundary-assignments-scope':
      return item(
        id,
        'Assignments boundary',
        'Assignment links',
        'Email boundary copy explains published links, snapshots, delivery rules, and assignment workflow scope.'
      );
    case 'boundary-results-scope':
      return item(
        id,
        'Results boundary',
        'Attempts/results',
        'Email boundary copy explains student attempts, result records, and teacher review scope.'
      );
    case 'boundary-ai-source-scope':
      return item(
        id,
        'AI/source boundary',
        'AI drafts/materials',
        'Email boundary copy explains teacher-reviewed AI drafts and safe source-material provenance.'
      );
    case 'verify-email-consumer':
      return item(
        id,
        'Verify email consumer',
        'Better Auth',
        'Auth verification sends the verify-email template through sendEmail with the teacher locale.'
      );
    case 'forgot-password-consumer':
      return item(
        id,
        'Forgot password consumer',
        'Better Auth',
        'Password reset sends the forgot-password template through sendEmail with the teacher locale.'
      );
    case 'newsletter-consumer':
      return item(
        id,
        'Newsletter consumer',
        'Teacher updates',
        'Newsletter subscribe confirms teacher classroom updates without implying student reminders.'
      );
    case 'contact-consumer':
      return item(
        id,
        'Contact consumer',
        'Support inbox',
        'Contact API sends structured classroom/product inquiries to support without mutating workspace records.'
      );
    case 'contact-structured-fields':
      return item(
        id,
        'Contact structured fields',
        'Classroom context',
        'Classroom inquiry fields preserve bounded learner, grade, material, routine, and need context separately from the message.'
      );
    case 'provider-registry':
      return item(
        id,
        'Provider registry',
        'Resend/Cloudflare',
        'Mail sending selects a configured provider through the provider registry while callers keep using sendEmail.'
      );
    case 'resend-template-render':
      return item(
        id,
        'Resend template render',
        'getTemplate first',
        'The Resend provider renders templates before sending raw subject, HTML, and text.'
      );
    case 'cloudflare-template-render':
      return item(
        id,
        'Cloudflare template render',
        'getTemplate first',
        'The Cloudflare provider renders templates before calling the Email Service REST API.'
      );
    case 'mail-disabled-guard':
      return item(
        id,
        'Mail disabled guard',
        'No provider send',
        'sendEmail exits early when mail is disabled instead of reaching a provider.'
      );
    case 'provider-secret-guard':
      return item(
        id,
        'Provider secret guard',
        'Secrets server-side',
        'Provider API keys and Cloudflare tokens stay in server environment lookups and out of handoff output.'
      );
    case 'action-url-guard':
      return item(
        id,
        'Action URL guard',
        'Not in handoff',
        'Verify and reset action URLs can render in emails but are not exposed by lifecycle handoff views.'
      );
    case 'recipient-privacy-guard':
      return item(
        id,
        'Recipient privacy guard',
        'Recipients hidden',
        'Lifecycle handoffs do not expose teacher names, recipient emails, or contact message text.'
      );
    case 'no-workspace-mutation':
      return item(
        id,
        'Workspace mutation boundary',
        'Mail sends only',
        'Transactional mail sends do not create activities, assignment links, attempts, or result exports.'
      );
    case 'learner-notification-guard':
      return item(
        id,
        'Learner notification guard',
        'Teacher email only',
        'Current transactional and newsletter flows do not send direct student assignment reminders.'
      );
    case 'transactional-mail-chain-gate':
      return item(
        id,
        'Transactional mail chain gate',
        '30 source files',
        'A focused gate keeps docs, render, templates, auth, contact, newsletter, provider, and privacy boundaries connected.'
      );
  }
}

function item(
  id: TransactionalMailLifecycleChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<TransactionalMailLifecycleChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
