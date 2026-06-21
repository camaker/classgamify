import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const authSourcePath = path.join(process.cwd(), 'src/auth/auth.ts');
const socialLoginButtonSourcePath = path.join(
  process.cwd(),
  'src/components/auth/social-login-button.tsx'
);
const googleOneTapPromptSourcePath = path.join(
  process.cwd(),
  'src/components/auth/google-one-tap-prompt.tsx'
);
const rootRouteSourcePath = path.join(process.cwd(), 'src/routes/__root.tsx');

test('auth stores OAuth state in a cookie before Google redirects', () => {
  const source = readFileSync(authSourcePath, 'utf8');

  assert.match(
    source,
    /authorizationEndpoint:\s*[\r\n\s]*'https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth'/,
    'Google OAuth should use the canonical authorization endpoint'
  );
  assert.match(
    source,
    /storeStateStrategy:\s*'cookie'/,
    'Google sign-in should not require a D1 verification write before redirect'
  );
});

test('social login validates Google OAuth URLs before redirecting', () => {
  const source = readFileSync(socialLoginButtonSourcePath, 'utf8');

  assert.match(
    source,
    /disableRedirect: true,/,
    'social login should inspect the Google authorization URL before redirecting'
  );
  assert.match(
    source,
    /isValidGoogleAuthorizationUrl\(authorizationUrl\)/,
    'social login should reject malformed Google authorization URLs'
  );
  assert.match(
    source,
    /parsed\.origin === 'https:\/\/accounts\.google\.com'/,
    'Google OAuth redirects should go only to accounts.google.com'
  );
  assert.match(
    source,
    /parsed\.pathname === '\/o\/oauth2\/v2\/auth'/,
    'Google OAuth redirects should use the v2 authorization endpoint'
  );
  assert.match(
    source,
    /parsed\.searchParams\.get\('response_type'\) === 'code'/,
    'Google OAuth URLs must include response_type=code'
  );
  assert.match(
    source,
    /Boolean\(parsed\.searchParams\.get\('client_id'\)\)/,
    'Google OAuth URLs must include client_id'
  );
  assert.match(
    source,
    /Boolean\(parsed\.searchParams\.get\('redirect_uri'\)\)/,
    'Google OAuth URLs must include redirect_uri'
  );
  assert.match(
    source,
    /Boolean\(parsed\.searchParams\.get\('state'\)\)/,
    'Google OAuth URLs must include state'
  );
  assert.match(
    source,
    /<Button\s+type="button"/,
    'Google login should not submit the surrounding email form'
  );
});

test('google one tap prompt uses provider status and auth-page guards', () => {
  const source = readFileSync(googleOneTapPromptSourcePath, 'utf8');

  assert.match(
    source,
    /useAuthProviderStatus\(/,
    'Google One Tap should ask the server which providers are publicly available'
  );
  assert.match(
    source,
    /promptOptions:\s*\{\s*fedCM: false,\s*\}/,
    'One Tap should use the classic prompt instead of Chrome FedCM'
  );
  assert.match(
    source,
    /isAuthRoute\(window\.location\.pathname\)/,
    'One Tap should not compete with explicit login controls on auth pages'
  );
  assert.match(
    source,
    /getCanonicalPathname\(pathname\)/,
    'One Tap auth route detection should handle localized auth URLs'
  );
  assert.equal(
    source.includes('sessionStorage'),
    false,
    'One Tap should not suppress future prompt attempts for the whole browser session'
  );
});

test('google one tap prompt is mounted once in the root document', () => {
  const source = readFileSync(rootRouteSourcePath, 'utf8');

  assert.match(
    source,
    /import \{ GoogleOneTapPrompt \} from '@\/components\/auth\/google-one-tap-prompt';/,
    'root document should import the global One Tap prompt component'
  );
  assert.equal(
    [...source.matchAll(/<GoogleOneTapPrompt \/>/g)].length,
    1,
    'One Tap should mount exactly once to avoid duplicate browser prompts'
  );
});
