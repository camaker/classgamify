import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  MAIL_TRANSACTIONAL_TEMPLATE_IDS,
  MAIL_TRANSACTIONAL_WORKSPACE_HANDOFF_ITEM_IDS,
  buildMailTransactionalWorkspaceHandoffView,
} from '@/mail/workspace-boundary';
import { getTemplate } from '@/mail/render';
import {
  TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_SOURCE_FILES,
  buildTransactionalMailLifecycleChainHandoffView,
  type TransactionalMailLifecycleChainHandoffItemId,
  type TransactionalMailLifecycleChainHandoffView,
} from '@/mail/transactional-mail-lifecycle-chain';
import { SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS } from '@/settings/notifications-view';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const MAIL_DOC_SOURCE = readFileSync('docs/mail.md', 'utf8');
const MAIL_TYPES_SOURCE = readFileSync('src/mail/types.ts', 'utf8');
const MAIL_LOCALE_SOURCE = readFileSync('src/mail/locale.ts', 'utf8');
const MAIL_RENDER_SOURCE = readFileSync('src/mail/render.ts', 'utf8');
const MAIL_INDEX_SOURCE = readFileSync('src/mail/index.ts', 'utf8');
const MAIL_WORKSPACE_BOUNDARY_SOURCE = readFileSync(
  'src/mail/workspace-boundary.ts',
  'utf8'
);
const EMAIL_LAYOUT_SOURCE = readFileSync(
  'src/mail/components/email-layout.tsx',
  'utf8'
);
const EMAIL_WORKSPACE_BOUNDARY_SOURCE = readFileSync(
  'src/mail/components/email-workspace-boundary.tsx',
  'utf8'
);
const VERIFY_EMAIL_SOURCE = readFileSync(
  'src/mail/templates/verify-email.tsx',
  'utf8'
);
const FORGOT_PASSWORD_SOURCE = readFileSync(
  'src/mail/templates/forgot-password.tsx',
  'utf8'
);
const SUBSCRIBE_NEWSLETTER_SOURCE = readFileSync(
  'src/mail/templates/subscribe-newsletter.tsx',
  'utf8'
);
const CONTACT_MESSAGE_SOURCE = readFileSync(
  'src/mail/templates/contact-message.tsx',
  'utf8'
);
const RESEND_PROVIDER_SOURCE = readFileSync(
  'src/mail/provider/resend.ts',
  'utf8'
);
const CLOUDFLARE_PROVIDER_SOURCE = readFileSync(
  'src/mail/provider/cloudflare.ts',
  'utf8'
);
const AUTH_SOURCE = readFileSync('src/auth/auth.ts', 'utf8');
const CONTACT_API_SOURCE = readFileSync('src/api/contact.ts', 'utf8');
const NEWSLETTER_API_SOURCE = readFileSync('src/api/newsletter.ts', 'utf8');
const CONTACT_INQUIRY_SOURCE = readFileSync('src/contact/inquiry.ts', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ACTION_URL = 'https://classgamify.example/reset?token=private';
const PRIVATE_CONTACT_MESSAGE = 'SECRET_CONTACT_MESSAGE_TEXT';
const PRIVATE_PROVIDER_TOKEN = 'SECRET_PROVIDER_TOKEN';
const PRIVATE_RAW_ERROR = 'SECRET_PROVIDER_ERROR';
const PRIVATE_RECIPIENT_EMAIL = 'private-teacher@example.test';
const PRIVATE_RECIPIENT_NAME = 'Private Teacher';
const PRIVATE_STORAGE_KEY = 'source-material/private/email.pdf';
const PRIVATE_STUDENT_IDENTIFIER = 'SECRET_STUDENT_IDENTIFIER';

test('transactional mail lifecycle chain exposes 30 safe mail slices', () => {
  const handoffView = buildTransactionalMailLifecycleChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Transactional mail lifecycle chain');
  assert.match(handoffView.description, /Thirty-slice transactional mail/);
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
    itemIds,
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
    usesTeacherNotificationUpdateHandoff: true,
  });
  assertNoPrivateTransactionalMailChainText(JSON.stringify(handoffView));
});

test('transactional mail lifecycle chain summarizes each linked mail boundary', () => {
  const handoffView = buildTransactionalMailLifecycleChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-mail-boundary', 'Teacher workspace'],
      ['mail-doc-provider-registry', 'Provider registry'],
      ['template-type-union', '4 templates'],
      ['template-set-registry', 'Render registry'],
      ['locale-normalization', 'Base fallback'],
      ['subject-localization', 'Message keys'],
      ['html-render-path', 'React email'],
      ['plain-text-render-path', 'HTML to text'],
      ['render-before-send', 'Prepared payload'],
      ['shared-email-layout', 'Localized HTML'],
      ['workspace-boundary-panel', 'Shared panel'],
      ['boundary-activities-scope', 'Activities/templates'],
      ['boundary-assignments-scope', 'Assignment links'],
      ['boundary-results-scope', 'Attempts/results'],
      ['boundary-ai-source-scope', 'AI drafts/materials'],
      ['verify-email-consumer', 'Better Auth'],
      ['forgot-password-consumer', 'Better Auth'],
      ['newsletter-consumer', 'Teacher updates'],
      ['contact-consumer', 'Support inbox'],
      ['contact-structured-fields', 'Classroom context'],
      ['provider-registry', 'Resend/Cloudflare'],
      ['resend-template-render', 'getTemplate first'],
      ['cloudflare-template-render', 'getTemplate first'],
      ['mail-disabled-guard', 'No provider send'],
      ['provider-secret-guard', 'Secrets server-side'],
      ['action-url-guard', 'Not in handoff'],
      ['recipient-privacy-guard', 'Recipients hidden'],
      ['no-workspace-mutation', 'Mail sends only'],
      ['learner-notification-guard', 'Teacher email only'],
      ['teacher-notification-update-boundary', '30 notification slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'workspace-boundary-panel'),
    'Shared panel'
  );
});

test('transactional mail lifecycle chain is backed by focused mail contracts', () => {
  assert.equal(TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of TRANSACTIONAL_MAIL_LIFECYCLE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing transactional mail lifecycle chain file ${filePath}`
    );
  }

  assert.equal(MAIL_TRANSACTIONAL_WORKSPACE_HANDOFF_ITEM_IDS.length, 30);
  assert.equal(SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS.length, 30);
  assert.equal(MAIL_TRANSACTIONAL_TEMPLATE_IDS.length, 4);
  assert.match(
    MAIL_WORKSPACE_BOUNDARY_SOURCE,
    /MAIL_TRANSACTIONAL_WORKSPACE_HANDOFF_ITEM_IDS[\s\S]*'template-set'[\s\S]*'private-data-guard'[\s\S]*buildMailTransactionalWorkspaceHandoffView[\s\S]*rendersBeforeProviderSend: true[\s\S]*usesProviderRegistryBoundary: true/,
    'Mail workspace boundary source should keep the 30-slice transactional handoff contract.'
  );
  assert.deepEqual(
    buildMailTransactionalWorkspaceHandoffView({
      locale: 'not-supported',
    }).itemViews,
    buildMailTransactionalWorkspaceHandoffView({ locale: 'en' }).itemViews
  );
});

test('transactional mail sources preserve render, locale, and template boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Public policy pages[\s\S]*teacher activity[\s\S]*public assignment link[\s\S]*student\s+attempt[\s\S]*results[\s\S]*AI-draft data model/,
    'docs/product.md should keep mail-adjacent trust copy tied to the ClassGamify data model.'
  );
  assert.match(
    MAIL_DOC_SOURCE,
    /Transactional email[\s\S]*verification[\s\S]*password reset[\s\S]*contact form[\s\S]*subscription welcome[\s\S]*provider registry[\s\S]*getTemplate\(\{ template, context \}\)[\s\S]*fallback to the base locale[\s\S]*shared workspace boundary panel/,
    'Mail docs should document template consumers, provider registry, locale fallback, and the shared boundary panel.'
  );
  assert.match(
    MAIL_TYPES_SOURCE,
    /export type EmailTemplate =[\s\S]*'forgotPassword'[\s\S]*'verifyEmail'[\s\S]*'subscribeNewsletter'[\s\S]*'contactMessage'/,
    'Mail types should keep the transactional template union explicit.'
  );
  assert.match(
    MAIL_LOCALE_SOURCE,
    /normalizeMailLocale\(value: unknown\)[\s\S]*isLocale\(value\) \? value : baseLocale/,
    'Mail locale helper should normalize unsupported locales to the base locale.'
  );
  assert.match(
    MAIL_RENDER_SOURCE,
    /const EmailTemplates = \{[\s\S]*forgotPassword: ForgotPassword,[\s\S]*verifyEmail: VerifyEmail,[\s\S]*subscribeNewsletter: SubscribeNewsletter,[\s\S]*contactMessage: ContactMessage,[\s\S]*\} as const/,
    'Mail render registry should include every transactional template.'
  );
  assert.match(
    MAIL_RENDER_SOURCE,
    /normalizeMailLocale\(context\.locale\)[\s\S]*renderEmailHtml\(email\)[\s\S]*toPlainText\(html\)[\s\S]*getEmailSubject\(\{[\s\S]*locale,[\s\S]*template/,
    'Mail render should normalize locale and produce HTML, text, and subject from the same template.'
  );
  assert.match(
    EMAIL_LAYOUT_SOURCE,
    /<Html lang=\{localeOptions\.locale\}>[\s\S]*mail_layout_team[\s\S]*mail_layout_copyright/,
    'Email layout should set normalized HTML language and localized ClassGamify footer copy.'
  );
  assert.match(
    EMAIL_WORKSPACE_BOUNDARY_SOURCE,
    /buildMailWorkspaceBoundaryView\(\{ locale \}\)[\s\S]*aria-label=\{view\.title\}[\s\S]*view\.items\.map/,
    'Email workspace boundary component should render the prepared boundary panel.'
  );
});

test('transactional mail consumers and providers keep lifecycle boundaries aligned', async () => {
  const combinedTemplateSource = [
    VERIFY_EMAIL_SOURCE,
    FORGOT_PASSWORD_SOURCE,
    SUBSCRIBE_NEWSLETTER_SOURCE,
    CONTACT_MESSAGE_SOURCE,
  ].join('\n');

  for (const source of [
    VERIFY_EMAIL_SOURCE,
    FORGOT_PASSWORD_SOURCE,
    SUBSCRIBE_NEWSLETTER_SOURCE,
    CONTACT_MESSAGE_SOURCE,
  ]) {
    assert.match(source, /<EmailLayout locale=\{localeOptions\.locale\}>/);
    assert.match(
      source,
      /<EmailWorkspaceBoundary locale=\{localeOptions\.locale\} \/>/
    );
  }

  assert.doesNotMatch(
    combinedTemplateSource,
    /Lang Study|getlangstudy|HSK|Hanzi|Website Contact|Contact Message from Website|MyApp|TanStarter|mksaas|generic SaaS/,
    'Transactional template source should not include inherited learning-site or starter copy.'
  );
  assert.match(
    AUTH_SOURCE,
    /sendResetPassword[\s\S]*sendEmail\(\{[\s\S]*template: 'forgotPassword'[\s\S]*sendVerificationEmail[\s\S]*template: 'verifyEmail'/,
    'Better Auth should send reset and verification mail through the transactional mail boundary.'
  );
  assert.match(
    NEWSLETTER_API_SOURCE,
    /subscribeNewsletter[\s\S]*sendEmail\(\{[\s\S]*template: 'subscribeNewsletter'[\s\S]*locale: getLocale\(\)/,
    'Newsletter subscribe should send teacher update confirmation through the transactional mail boundary.'
  );
  assert.match(
    CONTACT_API_SOURCE,
    /normalizeContactInquiryIntent\(data\.intent\)[\s\S]*buildContactClassroomInquiryPayload[\s\S]*sendEmail\(\{[\s\S]*template: 'contactMessage'[\s\S]*locale: getLocale\(\)/,
    'Contact API should send structured classroom inquiries through the transactional mail boundary.'
  );
  assert.match(
    CONTACT_INQUIRY_SOURCE,
    /CONTACT_CLASSROOM_INQUIRY_FIELD_IDS[\s\S]*'learners'[\s\S]*'grade'[\s\S]*'material'[\s\S]*'routine'[\s\S]*'need'/,
    'Contact inquiry should keep classroom details as bounded structured fields.'
  );
  assert.match(
    MAIL_INDEX_SOURCE,
    /const providerRegistry[\s\S]*resend: \(\) => new ResendProvider\(\)[\s\S]*cloudflare: \(\) => new CloudflareProvider\(\)[\s\S]*if \(!websiteConfig\.mail\?\.enable\)/,
    'Mail index should preserve the provider registry and disabled-send guard.'
  );
  assert.match(
    `${RESEND_PROVIDER_SOURCE}\n${CLOUDFLARE_PROVIDER_SOURCE}`,
    /sendTemplate\(params[\s\S]*getTemplate\(\{ template, context \}\)[\s\S]*sendRawEmail\(\{[\s\S]*subject: mailTemplate\.subject,[\s\S]*html: mailTemplate\.html,[\s\S]*text: mailTemplate\.text/,
    'Mail providers should render templates before sending raw payloads.'
  );
  assert.match(
    `${RESEND_PROVIDER_SOURCE}\n${CLOUDFLARE_PROVIDER_SOURCE}`,
    /serverEnv\.RESEND_API_KEY[\s\S]*serverEnv\.CLOUDFLARE_ACCOUNT_ID[\s\S]*serverEnv\.CLOUDFLARE_API_TOKEN/,
    'Mail provider secrets should stay server-side.'
  );

  const renderedTemplate = await getTemplate({
    context: {
      locale: 'en',
      name: 'Teacher',
      url: 'https://classgamify.example/verify?token=visible-only-in-email',
    },
    template: 'verifyEmail',
  });
  assert.match(renderedTemplate.html, /<html[^>]+lang="en"/);
  assert.match(renderedTemplate.text, /Workspace boundary/);
  assert.match(renderedTemplate.text, /Activities and templates/);
  assert.match(renderedTemplate.text, /Assignment links/);
  assert.match(renderedTemplate.text, /Student attempts and results/);
  assert.match(renderedTemplate.text, /AI drafts and source materials/);
});

test('transactional mail lifecycle focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Transactional mail lifecycle chain has a fast script-level gate via[\s\S]*scripts\/transactional-mail-lifecycle-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the transactional mail lifecycle chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /template set[\s\S]*locale fallback[\s\S]*HTML\/plain-text rendering[\s\S]*shared workspace boundary[\s\S]*auth reset\/verification[\s\S]*newsletter confirmation[\s\S]*contact classroom inquiry[\s\S]*provider registry[\s\S]*privacy guards/,
    'TEST-CATALOG should describe the transactional mail lifecycle scope.'
  );
});

function getHandoffValue(
  view: TransactionalMailLifecycleChainHandoffView,
  id: TransactionalMailLifecycleChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing transactional mail lifecycle item ${id}`);
  return item.value;
}

function assertNoPrivateTransactionalMailChainText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACTION_URL,
    PRIVATE_CONTACT_MESSAGE,
    PRIVATE_PROVIDER_TOKEN,
    PRIVATE_RAW_ERROR,
    PRIVATE_RECIPIENT_EMAIL,
    PRIVATE_RECIPIENT_NAME,
    PRIVATE_STORAGE_KEY,
    PRIVATE_STUDENT_IDENTIFIER,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Transactional mail lifecycle chain leaked private text: ${privateValue}`
    );
  }
}
