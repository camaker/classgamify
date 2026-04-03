import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Secrets required by deploy.yml (lines 39-54)
const REQUIRED_SECRETS = [
  'VITE_BASE_URL',
  'VITE_STRIPE_PRICE_PRO_MONTHLY',
  'VITE_STRIPE_PRICE_PRO_YEARLY',
  'VITE_STRIPE_PRICE_LIFETIME',
  'VITE_GOOGLE_ANALYTICS_ID',
  'VITE_CLARITY_PROJECT_ID',
  'VITE_PLAUSIBLE_SCRIPT',
  'VITE_UMAMI_WEBSITE_ID',
  'VITE_UMAMI_SCRIPT',
  'VITE_CRISP_WEBSITE_ID',
  'VITE_AFFILIATE_AFFONSO_ID',
  'VITE_AFFILIATE_PROMOTEKIT_ID',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_API_TOKEN',
];

function parseEnvFile(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf8');
  const env: Record<string, string> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    // Strip surrounding quotes (single or double)
    const value = rawValue.replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }

  return env;
}

const DELAY_MS = 1500;
const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setSecret(key: string, value: string, cwd: string): boolean {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      execSync(`gh secret set ${key}`, {
        input: value,
        stdio: ['pipe', 'inherit', 'inherit'],
        cwd,
      });
      return true;
    } catch {
      if (attempt < MAX_RETRIES) {
        const waitMs = DELAY_MS * attempt;
        console.log(
          `   ⏳ Retry ${attempt}/${MAX_RETRIES} for ${key} (waiting ${waitMs}ms)...`,
        );
        execSync(`sleep ${waitMs / 1000}`);
      }
    }
  }
  return false;
}

async function main() {
  const envPath = path.join(__dirname, '..', '.env.production');
  const rootDir = path.join(__dirname, '..');

  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.production not found');
    process.exit(1);
  }

  // Check gh CLI is available
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch {
    console.error('❌ GitHub CLI (gh) is not installed or not in PATH');
    process.exit(1);
  }

  // Check gh auth status
  try {
    execSync('gh auth status', { stdio: 'ignore' });
  } catch {
    console.error('❌ Not logged in to GitHub CLI. Run `gh auth login` first.');
    process.exit(1);
  }

  const env = parseEnvFile(envPath);
  const missing: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];
  let successCount = 0;

  console.log('🔄 Syncing secrets to GitHub Actions...\n');

  for (const key of REQUIRED_SECRETS) {
    const value = env[key];

    if (value === undefined) {
      missing.push(key);
      continue;
    }

    if (value === '') {
      skipped.push(key);
      console.log(`⏭️  ${key} (empty, skipped)`);
      continue;
    }

    if (setSecret(key, value, rootDir)) {
      successCount++;
      console.log(`✅ ${key}`);
    } else {
      failed.push(key);
      console.error(`❌ Failed to set ${key}`);
    }

    // Delay between requests to avoid GitHub API rate limits
    await sleep(DELAY_MS);
  }

  console.log(`\n--- Summary ---`);
  console.log(`✅ Set: ${successCount}`);
  if (skipped.length > 0) {
    console.log(`⏭️  Skipped (empty): ${skipped.join(', ')}`);
  }
  if (missing.length > 0) {
    console.log(`⚠️  Missing in .env.production: ${missing.join(', ')}`);
  }
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.join(', ')}`);
    process.exit(1);
  }
}

main();
