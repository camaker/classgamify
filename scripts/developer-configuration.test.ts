import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SOURCES = {
  auth: readFileSync('docs/auth.md', 'utf8'),
  configuration: readFileSync('docs/configuration.md', 'utf8'),
  env: readFileSync('docs/env.md', 'utf8'),
  envExample: readFileSync('.env.example', 'utf8'),
  mail: readFileSync('docs/mail.md', 'utf8'),
  packageJson: readFileSync('package.json', 'utf8'),
  payment: readFileSync('docs/payment.md', 'utf8'),
  productionEnvExample: readFileSync('.env.production.example', 'utf8'),
  readme: readFileSync('README.md', 'utf8'),
  storage: readFileSync('docs/storage.md', 'utf8'),
  websiteConfig: readFileSync('src/config/website.ts', 'utf8'),
  wrangler: readFileSync('wrangler.jsonc', 'utf8'),
};

const EVIDENCE = buildDeveloperConfigurationEvidence();

test('developer configuration contract stays Workers-safe and documented', () => {
  assert.match(
    SOURCES.configuration,
    /developer-configuration\.test\.ts[\s\S]*verification[\s\S]*classroom\s+product loop/
  );
  assert.ok(EVIDENCE.githubActionsDeployAbsent);
  assert.ok(EVIDENCE.predeployGateIncludesBuild);
  assert.ok(EVIDENCE.manualDeployCommandDocumented);
  assert.ok(EVIDENCE.healthCheckOriginDocumented);
  assert.ok(EVIDENCE.workerTypegenCommandDocumented);
});

function buildDeveloperConfigurationEvidence() {
  const envExamples = `${SOURCES.envExample}\n${SOURCES.productionEnvExample}`;
  const developerFacingSources = [
    SOURCES.readme,
    SOURCES.configuration,
    SOURCES.env,
    SOURCES.envExample,
    SOURCES.productionEnvExample,
    SOURCES.packageJson,
    SOURCES.websiteConfig,
    SOURCES.wrangler,
  ].join('\n');

  return {
    authDocsLinkConfigurationBoundary:
      /Configuration\]\(\.\/configuration\.md\)/.test(SOURCES.auth) &&
      /teacher workspace[\s\S]*saved\s+activities[\s\S]*assignment links[\s\S]*source materials[\s\S]*attempts[\s\S]*results/i.test(
        SOURCES.auth
      ),
    buildRuntimeEnvSplitDocumented:
      /clientEnv[\s\S]*Build time[\s\S]*VITE_\*/.test(SOURCES.env) &&
      /serverEnv[\s\S]*Runtime[\s\S]*process\.env/.test(SOURCES.env),
    biomeCheckCommandDocumented:
      /"check":\s*"biome check"/.test(SOURCES.packageJson) &&
      /pnpm check/.test(SOURCES.configuration),
    cloudflareBuildEnvDocumented:
      /set them in the Cloudflare project build environment/.test(
        SOURCES.configuration
      ) &&
      /Set VITE_BASE_URL in the Cloudflare project build environment/.test(
        SOURCES.productionEnvExample
      ),
    cloudflareDeployOwnershipDocumented:
      /Cloudflare Git integration owns production builds and deploys/.test(
        SOURCES.configuration
      ) &&
      /Cloudflare Workers is the production build and deploy system/.test(
        SOURCES.readme
      ),
    configurationProductLoopDocumented:
      /Activity -> Assignment -> Attempt -> Results/.test(
        SOURCES.configuration
      ) &&
      /teachers create activities[\s\S]*publish assignments[\s\S]*students complete attempts[\s\S]*teachers review results/i.test(
        SOURCES.configuration
      ),
    d1BindingName: extractBindingName(SOURCES.wrangler, 'd1_databases'),
    envExamplesKeepSecretsBlank: envSecretPlaceholdersAreBlank(envExamples),
    envExamplesUseClassGamifyOrigin:
      envExampleUsesOrigin(SOURCES.envExample) &&
      envExampleUsesOrigin(SOURCES.productionEnvExample),
    e2eLocalGuardDocumented:
      /E2E helpers are local-first and disabled outside the guarded local test mode/.test(
        SOURCES.configuration
      ),
    githubActionsDeployAbsent: githubActionsDeployWorkflowIsAbsent(),
    healthCheckOriginDocumented:
      /health checks[\s\S]*configured ClassGamify[\s\S]*`VITE_BASE_URL`/.test(
        SOURCES.configuration
      ),
    imageGenerationProviderCopyExcluded:
      !/fal\.ai|image generation|AI image generation|图像生成/i.test(
        developerFacingSources
      ),
    legacyStarterCopyExcluded:
      !/mksaas|tanstarter|getlangstudy|Lang Study|Hanzi|HSK/i.test(
        developerFacingSources
      ),
    localeCheckCommandDocumented:
      /"locale:check":\s*"tsx scripts\/check-locale-keys\.ts"/.test(
        SOURCES.packageJson
      ) && /pnpm locale:check/.test(SOURCES.configuration),
    mailDocsWorkspaceBoundaryDocumented:
      /workspace-boundary\.ts[\s\S]*saved activities[\s\S]*assignment links[\s\S]*student attempts\/results[\s\S]*teacher-reviewed AI drafts[\s\S]*source-material/.test(
        SOURCES.mail
      ),
    manualDeployCommandDocumented:
      /"deploy":\s*"pnpm run build && wrangler deploy --config dist\/server\/wrangler\.json --keep-vars/.test(
        SOURCES.packageJson
      ) &&
      /Use `pnpm deploy` only for a\s+manual Cloudflare Workers deployment/.test(
        SOURCES.configuration
      ),
    manualSecretSyncBoundaryDocumented:
      /"sync-worker-secrets":\s*"wrangler secret bulk \.env\.production"/.test(
        SOURCES.packageJson
      ) &&
      /For local manual secret sync only/.test(SOURCES.productionEnvExample) &&
      /not a CI deploy path/.test(SOURCES.configuration),
    oauthCallbackUsesClassGamifyOrigin:
      /https:\/\/classgamify\.example\/api\/auth\/callback\/google/.test(
        envExamples
      ) &&
      /https:\/\/classgamify\.example\/api\/auth\/callback\/google/.test(
        SOURCES.configuration
      ),
    paymentDocsCapabilityBoundaryDocumented:
      /activity creation[\s\S]*assignment publishing[\s\S]*AI drafts[\s\S]*source\s+materials[\s\S]*result review/i.test(
        SOURCES.payment
      ),
    predeployGateIncludesBuild:
      /"predeploy":\s*"pnpm locale:check && pnpm check && pnpm build"/.test(
        SOURCES.packageJson
      ) &&
      /Run `pnpm predeploy` locally before release pushes/.test(
        SOURCES.configuration
      ) &&
      /locale checks[\s\S]*Biome checks[\s\S]*production build/.test(
        SOURCES.readme
      ),
    productionBuildCommandDocumented:
      /"build":\s*"node --max-old-space-size=8192 \.\/node_modules\/vite\/bin\/vite\.js build"/.test(
        SOURCES.packageJson
      ) && /pnpm build/.test(SOURCES.configuration),
    r2BindingName: extractBindingName(SOURCES.wrangler, 'r2_buckets'),
    readmeLinksConfigurationBoundary: /docs\/configuration\.md/.test(
      SOURCES.readme
    ),
    storageDocsSourceMaterialBoundaryDocumented:
      /source-material\s+privacy[\s\S]*student payload safety/i.test(
        SOURCES.storage
      ) &&
      /Student assignment payloads[\s\S]*they do not expose[\s\S]*source-material[\s\S]*storage keys/i.test(
        SOURCES.storage
      ),
    vitePublicConfigBoundaryDocumented:
      /VITE_\*[\s\S]*build-time inputs[\s\S]*public configuration only/.test(
        SOURCES.configuration
      ) &&
      /Do not put secrets in `VITE_\*` variables/.test(SOURCES.configuration),
    websiteConfigMailSenderUsesClassGamify:
      /fromEmail:\s*'ClassGamify <support@classgamify\.com>'/.test(
        SOURCES.websiteConfig
      ) &&
      /supportEmail:\s*'ClassGamify <support@classgamify\.com>'/.test(
        SOURCES.websiteConfig
      ),
    websiteConfigStorageProviderR2Enabled:
      /storage:\s*\{[\s\S]*enable:\s*true[\s\S]*provider:\s*'r2'/.test(
        SOURCES.websiteConfig
      ),
    workerRuntimeSecretBoundaryDocumented:
      /Worker runtime secrets belong in Cloudflare Worker secrets/.test(
        SOURCES.configuration
      ) &&
      /runtime secrets[\s\S]*Cloudflare[\s\S]*Worker secrets/i.test(
        SOURCES.productionEnvExample
      ),
    workerTypegenCommandDocumented:
      /"cf-typegen":\s*"wrangler types --include-runtime=false --env-interface Env --env-file \.env\.example"/.test(
        SOURCES.packageJson
      ) &&
      /"postinstall":\s*"pnpm run cf-typegen"/.test(SOURCES.packageJson) &&
      /Regenerate Worker binding types with `pnpm cf-typegen`/.test(
        SOURCES.configuration
      ),
    wranglerKeepVarsEnabled: /"keep_vars":\s*true/.test(SOURCES.wrangler),
  };
}

function extractBindingName(source: string, sectionName: string) {
  return (
    new RegExp(
      `"${sectionName}"\\s*:\\s*\\[[\\s\\S]*?"binding"\\s*:\\s*"([^"]+)"`
    ).exec(source)?.[1] ?? null
  );
}

function envExampleUsesOrigin(source: string) {
  return /^VITE_BASE_URL='https:\/\/classgamify\.example'$/m.test(source);
}

function envSecretPlaceholdersAreBlank(source: string) {
  return [
    'BETTER_AUTH_SECRET',
    'BEEHIIV_API_KEY',
    'CLOUDFLARE_API_TOKEN',
    'CREEM_API_KEY',
    'CREEM_WEBHOOK_SECRET',
    'DISCORD_WEBHOOK_URL',
    'FEISHU_WEBHOOK_URL',
    'GOOGLE_CLIENT_SECRET',
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ].every((key) => envAssignmentsAreBlank(source, key));
}

function envAssignmentsAreBlank(source: string, key: string) {
  const matches = [
    ...source.matchAll(new RegExp(`^${key}=([^\\r\\n]*)`, 'gm')),
  ];

  return (
    matches.length >= 2 && matches.every((match) => match[1]?.trim() === "''")
  );
}

function githubActionsDeployWorkflowIsAbsent() {
  const workflowDirectory = '.github/workflows';

  if (!existsSync(workflowDirectory)) return true;

  const workflowSources = readdirSync(workflowDirectory)
    .filter((fileName) => /\.ya?ml$/i.test(fileName))
    .map((fileName) => readFileSync(join(workflowDirectory, fileName), 'utf8'))
    .join('\n');

  return !/wrangler\s+deploy|pnpm\s+deploy|cloudflare\s+workers/i.test(
    workflowSources
  );
}
