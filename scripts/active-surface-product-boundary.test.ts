import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const ACTIVE_SURFACE_SOURCE_FILES = [
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
  'src/env/server.ts',
  'src/auth/workspace-boundary.ts',
  'src/contact/inquiry-view.ts',
  'src/api/contact.ts',
  'src/components/contact/contact-form-card.tsx',
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
const ALLOWED_LEGACY_MIGRATION_FILES = [
  'README.md',
  'docs/product.md',
] as const;
const LEGACY_COPY_PATTERN =
  /mksaas|getlangstudy|Lang Study|Hanzi|HSK|TanStarter|MyApp/i;
const UNUSED_PROVIDER_COPY_PATTERN =
  /fal\.ai|AI image generation|image generation provider/i;

test('active surface focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Active surface product boundary has a fast script-level gate via[\s\S]*scripts\/active-surface-product-boundary\.test\.ts/,
    'TEST-CATALOG should document the active surface product boundary gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /account governance[\s\S]*contact[\s\S]*billing\/payment callback[\s\S]*mail[\s\S]*notification[\s\S]*developer configuration[\s\S]*ClassGamify terms/,
    'TEST-CATALOG should document the active account/contact/billing/mail/notification/configuration boundary scope.'
  );
});

test('current active account, contact, billing, mail, and config sources keep legacy copy out', () => {
  const legacyLeaks = ACTIVE_SURFACE_SOURCE_FILES.filter(
    (filePath) =>
      !(ALLOWED_LEGACY_MIGRATION_FILES as readonly string[]).includes(
        filePath
      ) && LEGACY_COPY_PATTERN.test(readFileSync(filePath, 'utf8'))
  );

  assert.deepEqual(
    legacyLeaks,
    [],
    'Current active forms, billing pages, mail templates, docs, and configuration examples should not reintroduce copied learning-site or starter names.'
  );
});

test('current active sources keep unused provider copy out of the product model', () => {
  const providerCopyLeaks = ACTIVE_SURFACE_SOURCE_FILES.filter((filePath) =>
    UNUSED_PROVIDER_COPY_PATTERN.test(readFileSync(filePath, 'utf8'))
  );

  assert.deepEqual(
    providerCopyLeaks,
    [],
    'Active account, contact, billing, mail, notification, and configuration surfaces must not describe unused image-generation provider copy.'
  );
});
