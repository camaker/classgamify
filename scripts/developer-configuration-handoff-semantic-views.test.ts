import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import {
  buildDeveloperConfigurationHandoffView,
  DEVELOPER_CONFIGURATION_HANDOFF_ITEM_IDS,
  type DeveloperConfigurationHandoffEvidence,
  type DeveloperConfigurationHandoffItemId,
  type DeveloperConfigurationHandoffView,
} from '@/config/developer-configuration-handoff';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_AI_PROVIDER_TOKEN = 'image-generation-provider-secret';
const SECRET_OAUTH_SECRET = 'google-oauth-client-secret';
const SECRET_PAYMENT_KEY = 'sk_live_payment_provider_secret';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_ATTEMPT = 'SECRET_STUDENT_ATTEMPT_RECORD';
const SECRET_TEACHER_ACTIVITY = 'SECRET_TEACHER_ACTIVITY_CONTENT';
const SECRET_WORKER_TOKEN = 'cloudflare-worker-api-token-secret';

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

test('developer configuration handoff exposes 30 safe configuration slices', () => {
  const handoffView = buildDeveloperConfigurationHandoffView(EVIDENCE);
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...DEVELOPER_CONFIGURATION_HANDOFF_ITEM_IDS]);
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
    documentsBuildTimeValues: true,
    documentsCloudflareDeployOwnership: true,
    documentsHealthCheckOrigin: true,
    documentsLocalVerificationGate: true,
    documentsManualDeployBoundary: true,
    documentsRuntimeSecrets: true,
    exposesProviderApiTokens: false,
    exposesRawOauthSecrets: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds,
    keepsE2eHelpersLocal: true,
    keepsImageGenerationProviderOut: true,
    keepsLegacyCopyOut: true,
    readsSourceMaterialFileBytes: false,
    scope: 'developer-configuration-boundary',
    usesWorkerBindingsForData: true,
  });
  assertNoPrivateDeveloperConfigurationText(JSON.stringify(handoffView));
});

test('developer configuration handoff summarizes docs and worker config state', () => {
  const handoffView = buildDeveloperConfigurationHandoffView(EVIDENCE);

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['readme-boundary-link', 'Linked'],
      [
        'configuration-product-loop',
        'Activity -> Assignment -> Attempt -> Results',
      ],
      ['cloudflare-deploy-owner', 'Cloudflare Git'],
      ['github-actions-deploy-boundary', 'Absent'],
      ['local-predeploy-gate', 'locale + check + build'],
      ['locale-check-command', 'pnpm locale:check'],
      ['biome-check-command', 'pnpm check'],
      ['production-build-command', 'pnpm build'],
      ['manual-deploy-command', 'pnpm deploy'],
      ['health-check-origin', 'VITE_BASE_URL'],
      ['cloudflare-build-env', 'Cloudflare build env'],
      ['build-runtime-env-split', 'Build/runtime split'],
      ['vite-public-config-boundary', 'VITE public only'],
      ['worker-runtime-secret-boundary', 'Worker secrets'],
      ['manual-secret-sync-boundary', 'Local-only sync'],
      ['d1-binding', 'DB'],
      ['r2-binding', 'BUCKET'],
      ['worker-typegen-command', 'pnpm cf-typegen'],
      ['auth-workspace-doc', 'Configuration linked'],
      ['mail-workspace-doc', 'Workspace boundary'],
      ['payment-capability-doc', 'Plan capabilities'],
      ['storage-source-material-doc', 'Source-material boundary'],
      ['env-example-origin', 'ClassGamify origin'],
      ['env-example-secret-placeholders', 'Blank placeholders'],
      ['oauth-callback-example', 'ClassGamify callback'],
      ['website-mail-sender', 'ClassGamify sender'],
      ['website-storage-provider', 'R2 enabled'],
      ['wrangler-keep-vars', 'keep_vars true'],
      ['e2e-local-guard', 'Local e2e only'],
      ['legacy-provider-copy-guard', 'ClassGamify only'],
    ]
  );
  assertNoPrivateDeveloperConfigurationText(JSON.stringify(handoffView));
});

test('developer configuration handoff localizes Chinese configuration boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildDeveloperConfigurationHandoffView(EVIDENCE);

    assert.equal(handoffView.title, '开发者配置边界交接');
    assert.match(handoffView.description, /30 切片开发者配置契约/);
    assert.equal(
      getHandoffValue(handoffView, 'readme-boundary-link'),
      '已链接'
    );
    assert.equal(
      getHandoffValue(handoffView, 'cloudflare-deploy-owner'),
      'Cloudflare Git'
    );
    assert.equal(
      getHandoffValue(handoffView, 'worker-runtime-secret-boundary'),
      'Worker Secret'
    );
    assert.equal(
      getHandoffValue(handoffView, 'local-predeploy-gate'),
      'locale + check + build'
    );
    assert.equal(
      getHandoffValue(handoffView, 'manual-secret-sync-boundary'),
      '仅本地同步'
    );
    assert.equal(getHandoffValue(handoffView, 'e2e-local-guard'), '仅本地 e2e');
    assert.equal(getHandoffValue(handoffView, 'd1-binding'), 'DB');
    assert.equal(
      getHandoffValue(handoffView, 'env-example-secret-placeholders'),
      '空白占位'
    );
    assert.equal(
      getHandoffValue(handoffView, 'legacy-provider-copy-guard'),
      '仅 ClassGamify'
    );
    assertNoPrivateDeveloperConfigurationText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('developer configuration contract stays Workers-safe and documented', () => {
  const handoffSource = readFileSync(
    'src/config/developer-configuration-handoff.ts',
    'utf8'
  );

  assert.doesNotMatch(handoffSource, /node:fs|readFileSync|existsSync/);
  assert.match(
    handoffSource,
    /export type DeveloperConfigurationHandoffEvidence/
  );
  assert.match(
    SOURCES.configuration,
    /developer-configuration-handoff\.ts[\s\S]*30-slice[\s\S]*developer configuration boundary/
  );
  assert.ok(EVIDENCE.githubActionsDeployAbsent);
  assert.ok(EVIDENCE.predeployGateIncludesBuild);
  assert.ok(EVIDENCE.manualDeployCommandDocumented);
  assert.ok(EVIDENCE.healthCheckOriginDocumented);
  assert.ok(EVIDENCE.workerTypegenCommandDocumented);
});

function buildDeveloperConfigurationEvidence(): DeveloperConfigurationHandoffEvidence {
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
      /"cf-typegen":\s*"wrangler types --include-runtime=false --env-interface Env"/.test(
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

function getHandoffValue(
  view: DeveloperConfigurationHandoffView,
  id: DeveloperConfigurationHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing developer configuration handoff item ${id}`);
  return item.value;
}

function assertNoPrivateDeveloperConfigurationText(serializedView: string) {
  for (const privateValue of [
    SECRET_AI_PROVIDER_TOKEN,
    SECRET_OAUTH_SECRET,
    SECRET_PAYMENT_KEY,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_ATTEMPT,
    SECRET_TEACHER_ACTIVITY,
    SECRET_WORKER_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Developer configuration handoff leaked private text: ${privateValue}`
    );
  }
}
