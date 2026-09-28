import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');
const UPDATE_PASSWORD_CARD_SOURCE = readFileSync(
  'src/components/settings/security/update-password-card.tsx',
  'utf8'
);
const DELETE_ACCOUNT_CARD_SOURCE = readFileSync(
  'src/components/settings/security/delete-account-card.tsx',
  'utf8'
);

test('settings security controls keep localized failures and explicit delete boundaries', () => {
  assert.match(
    UPDATE_PASSWORD_CARD_SOURCE,
    /const message = m\.settings_security_update_password_fail\(\);/,
    'Password update failures should use localized security copy instead of raw auth errors.'
  );
  assert.match(
    DELETE_ACCOUNT_CARD_SOURCE,
    /const message = m\.settings_security_delete_account_fail\(\);/,
    'Delete-account failures should use localized security copy instead of raw auth errors.'
  );
  assert.match(DELETE_ACCOUNT_CARD_SOURCE, /authClient\.deleteUser/);
  assert.match(
    DELETE_ACCOUNT_CARD_SOURCE,
    /settings_security_delete_account_warning/
  );
  assert.match(
    DELETE_ACCOUNT_CARD_SOURCE,
    /settings_security_delete_account_confirm_description[\s\S]*onClick=\{handleDeleteAccount\}/,
    'Delete-account confirmation should explicitly invoke the destructive account deletion client through the confirm button.'
  );
});
