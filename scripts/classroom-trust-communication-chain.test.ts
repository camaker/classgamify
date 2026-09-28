import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const CONFIGURATION_DOC_SOURCE = readFileSync('docs/configuration.md', 'utf8');
const AUTH_DOC_SOURCE = readFileSync('docs/auth.md', 'utf8');
const MAIL_DOC_SOURCE = readFileSync('docs/mail.md', 'utf8');
const PAYMENT_DOC_SOURCE = readFileSync('docs/payment.md', 'utf8');
const STORAGE_DOC_SOURCE = readFileSync('docs/storage.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

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
    /Classroom trust communication chain has a fast script-level gate via[\s\S]*scripts\/classroom-trust-communication-chain\.test\.ts/,
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
