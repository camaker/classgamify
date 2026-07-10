export const ACTIVE_SURFACE_PRODUCT_BOUNDARY_ITEM_IDS = [
  'developer-configuration',
  'env-example-origin',
  'env-secret-placeholders',
  'auth-entry-copy',
  'auth-workspace-boundary',
  'contact-form-copy',
  'contact-classroom-intake',
  'contact-email-routing',
  'profile-settings-copy',
  'security-settings-copy',
  'account-governance-lifecycle-chain',
  'notification-settings-copy',
  'notification-update-handoff',
  'billing-settings-copy',
  'billing-workspace-handoff',
  'payment-callback-handoff',
  'hosted-billing-boundary',
  'mail-workspace-boundary',
  'mail-template-copy',
  'newsletter-settings-copy',
  'configuration-docs',
  'auth-docs',
  'mail-docs',
  'payment-docs',
  'newsletter-docs',
  'storage-docs',
  'website-config-sender',
  'worker-config-bindings',
  'legacy-copy-guard',
  'provider-copy-guard',
] as const;

export const ACTIVE_SURFACE_PRODUCT_BOUNDARY_SOURCE_FILES = [
  '.env.example',
  '.env.production.example',
  'README.md',
  'docs/auth.md',
  'docs/configuration.md',
  'docs/env.md',
  'docs/mail.md',
  'docs/newsletter.md',
  'docs/payment.md',
  'docs/storage.md',
  'package.json',
  'wrangler.jsonc',
  'src/config/website.ts',
  'src/config/developer-configuration-handoff.ts',
  'src/auth/workspace-boundary.ts',
  'src/contact/inquiry-view.ts',
  'src/api/contact.ts',
  'src/components/contact/contact-form-card.tsx',
  'src/auth/account-governance-lifecycle-chain.ts',
  'src/settings/profile-view.ts',
  'src/settings/security-view.ts',
  'src/settings/notifications-view.ts',
  'src/settings/billing-view.ts',
  'src/routes/settings/billing.tsx',
  'src/payment/payment-status-view.ts',
  'src/mail/workspace-boundary.ts',
  'src/mail/templates/verify-email.tsx',
  'src/mail/templates/forgot-password.tsx',
  'src/mail/templates/subscribe-newsletter.tsx',
  'src/mail/templates/contact-message.tsx',
] as const;

export const ACTIVE_SURFACE_ALLOWED_LEGACY_MIGRATION_FILES = [
  'README.md',
  'docs/product.md',
] as const;

export type ActiveSurfaceProductBoundaryItemId =
  (typeof ACTIVE_SURFACE_PRODUCT_BOUNDARY_ITEM_IDS)[number];

export type ActiveSurfaceProductBoundarySourceFile =
  (typeof ACTIVE_SURFACE_PRODUCT_BOUNDARY_SOURCE_FILES)[number];

export type ActiveSurfaceProductBoundaryItemView = {
  ariaLabel: string;
  description: string;
  id: ActiveSurfaceProductBoundaryItemId;
  label: string;
  value: string;
};

export type ActiveSurfaceProductBoundaryPrivacyContract = {
  activeSourceFileCount: number;
  allowsLegacyMigrationCopyOnlyIn: string[];
  currentSurfacesUseClassGamifyCopy: true;
  exposesProviderSecrets: false;
  exposesRawCheckoutSessions: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswers: false;
  exposesStudentIdentifiers: false;
  exposesTeacherEmail: false;
  itemIds: ActiveSurfaceProductBoundaryItemId[];
  keepsCurrentFormsProductScoped: true;
  keepsDeveloperExamplesProductScoped: true;
  keepsProviderCopyOut: true;
  protectsClassroomProductLoop: true;
  sourceFiles: string[];
  usesAccountGovernanceLifecycleChain: true;
  usesPaymentCallbackHandoff: true;
};

export type ActiveSurfaceProductBoundaryView = {
  description: string;
  itemViews: ActiveSurfaceProductBoundaryItemView[];
  privacy: ActiveSurfaceProductBoundaryPrivacyContract;
  title: string;
};

export function buildActiveSurfaceProductBoundaryView(): ActiveSurfaceProductBoundaryView {
  const itemViews = ACTIVE_SURFACE_PRODUCT_BOUNDARY_ITEM_IDS.map((id) =>
    buildActiveSurfaceProductBoundaryItemView(id)
  );

  return {
    description:
      'Thirty-slice source boundary for active account governance, contact, billing/payment callback, mail, notification, and developer configuration surfaces that must speak in ClassGamify classroom terms.',
    itemViews,
    privacy: {
      activeSourceFileCount:
        ACTIVE_SURFACE_PRODUCT_BOUNDARY_SOURCE_FILES.length,
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
      itemIds: [...ACTIVE_SURFACE_PRODUCT_BOUNDARY_ITEM_IDS],
      keepsCurrentFormsProductScoped: true,
      keepsDeveloperExamplesProductScoped: true,
      keepsProviderCopyOut: true,
      protectsClassroomProductLoop: true,
      sourceFiles: [...ACTIVE_SURFACE_PRODUCT_BOUNDARY_SOURCE_FILES],
      usesAccountGovernanceLifecycleChain: true,
      usesPaymentCallbackHandoff: true,
    },
    title: 'Active surface product boundary',
  };
}

function buildActiveSurfaceProductBoundaryItemView(
  id: ActiveSurfaceProductBoundaryItemId
): ActiveSurfaceProductBoundaryItemView {
  const item = getActiveSurfaceProductBoundaryItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getActiveSurfaceProductBoundaryItem(
  id: ActiveSurfaceProductBoundaryItemId
): Omit<ActiveSurfaceProductBoundaryItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'developer-configuration':
      return item(
        id,
        'Developer configuration',
        '30 configuration slices',
        'Developer-facing examples stay aligned to the ClassGamify classroom deployment boundary.'
      );
    case 'env-example-origin':
      return item(
        id,
        'Env example origin',
        'https://classgamify.example',
        'Environment examples use a ClassGamify origin for active callbacks and health checks.'
      );
    case 'env-secret-placeholders':
      return item(
        id,
        'Secret placeholders',
        'Blank placeholders',
        'Example secrets stay blank and do not document live provider tokens.'
      );
    case 'auth-entry-copy':
      return item(
        id,
        'Auth entry copy',
        'Teacher workspace',
        'Login and registration copy points at the teacher workspace instead of a copied learning product.'
      );
    case 'auth-workspace-boundary':
      return item(
        id,
        'Auth workspace boundary',
        'Account -> Activities -> Assignments -> Results',
        'Auth workspace semantics protect activity, assignment, source-material, and result access.'
      );
    case 'contact-form-copy':
      return item(
        id,
        'Contact form copy',
        'Classroom inquiry',
        'Current contact forms ask for classroom routines, materials, template needs, and result review.'
      );
    case 'contact-classroom-intake':
      return item(
        id,
        'Contact classroom intake',
        '30 intake slices',
        'Classroom intake keeps structured teacher context separate from private student records.'
      );
    case 'contact-email-routing':
      return item(
        id,
        'Contact email routing',
        'Structured contact email',
        'Contact submissions rebuild a structured email payload before sending through the mail boundary.'
      );
    case 'profile-settings-copy':
      return item(
        id,
        'Profile settings copy',
        'Teacher identity',
        'Profile settings describe how teacher identity appears across activities, assignment handoff, and review.'
      );
    case 'security-settings-copy':
      return item(
        id,
        'Security settings copy',
        'Workspace access',
        'Security settings frame passwords and deletion as teacher workspace controls.'
      );
    case 'account-governance-lifecycle-chain':
      return item(
        id,
        'Account governance lifecycle chain',
        '30 governance slices',
        'Account governance semantics connect auth, profile/security, deletion, admin users, billing/payment callback, files, and privacy guards.'
      );
    case 'notification-settings-copy':
      return item(
        id,
        'Notification settings copy',
        'Classroom updates',
        'Notification settings cover teacher-controlled updates rather than student reminders.'
      );
    case 'notification-update-handoff':
      return item(
        id,
        'Notification update handoff',
        '30 update slices',
        'Update handoff semantics protect activity content, snapshots, attempts, links, and provider errors.'
      );
    case 'billing-settings-copy':
      return item(
        id,
        'Billing settings copy',
        'Plan access',
        'Billing settings connect plans to activity, assignment, AI draft, result, and source-material capabilities.'
      );
    case 'billing-workspace-handoff':
      return item(
        id,
        'Billing workspace handoff',
        '30 billing slices',
        'Billing handoff semantics keep hosted provider flows away from classroom data mutation.'
      );
    case 'payment-callback-handoff':
      return item(
        id,
        'Payment callback handoff',
        '30 callback slices',
        'Payment callback semantics keep hosted checkout status, polling, safe returns, plan refresh, provider sessions, and classroom data guards aligned.'
      );
    case 'hosted-billing-boundary':
      return item(
        id,
        'Hosted billing boundary',
        'Hosted checkout and portal',
        'Checkout and portal actions stay hosted and do not expose provider sessions in active surfaces.'
      );
    case 'mail-workspace-boundary':
      return item(
        id,
        'Mail workspace boundary',
        'Activities, assignments, results, AI sources',
        'Transactional mail includes the classroom workspace boundary without mutating product records.'
      );
    case 'mail-template-copy':
      return item(
        id,
        'Mail template copy',
        'ClassGamify transactional mail',
        'Email templates use ClassGamify teacher-workspace subjects and body copy.'
      );
    case 'newsletter-settings-copy':
      return item(
        id,
        'Newsletter settings copy',
        'Teacher product email',
        'Newsletter settings remain scoped to teacher product updates, templates, worksheets, and review.'
      );
    case 'configuration-docs':
      return item(
        id,
        'Configuration docs',
        'Cloudflare-owned deploy path',
        'Configuration docs keep active examples tied to Workers, D1, R2, and local verification.'
      );
    case 'auth-docs':
      return item(
        id,
        'Auth docs',
        'Teacher workspace secrets',
        'Auth docs describe workspace access, activities, assignments, source materials, attempts, and results.'
      );
    case 'mail-docs':
      return item(
        id,
        'Mail docs',
        'Transactional workspace',
        'Mail docs describe transactional templates around ClassGamify workspace boundaries.'
      );
    case 'payment-docs':
      return item(
        id,
        'Payment docs',
        'Classroom capability boundary',
        'Payment docs describe capabilities for creation, publishing, AI drafts, source materials, and review.'
      );
    case 'newsletter-docs':
      return item(
        id,
        'Newsletter docs',
        'Logged-in settings card',
        'Newsletter docs keep anonymous capture out until explicit product placement exists.'
      );
    case 'storage-docs':
      return item(
        id,
        'Storage docs',
        'Source-material privacy',
        'Storage docs preserve source-material privacy and student payload safety.'
      );
    case 'website-config-sender':
      return item(
        id,
        'Website config sender',
        'ClassGamify support sender',
        'Website configuration uses ClassGamify mail sender and support identity.'
      );
    case 'worker-config-bindings':
      return item(
        id,
        'Worker config bindings',
        'DB and BUCKET',
        'Worker configuration keeps ClassGamify D1 and R2 bindings explicit.'
      );
    case 'legacy-copy-guard':
      return item(
        id,
        'Legacy copy guard',
        'Current surfaces: ClassGamify only',
        'Current active forms, billing, mail, and configuration examples do not use legacy learning-site names.'
      );
    case 'provider-copy-guard':
      return item(
        id,
        'Provider copy guard',
        'No unused provider copy',
        'Active surfaces do not describe unused image-generation provider copy as part of the product model.'
      );
  }
}

function item(
  id: ActiveSurfaceProductBoundaryItemId,
  label: string,
  value: string,
  description: string
): Omit<ActiveSurfaceProductBoundaryItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
