import { m } from '@/locale/paraglide/messages';

export const DEVELOPER_CONFIGURATION_HANDOFF_ITEM_IDS = [
  'readme-boundary-link',
  'configuration-product-loop',
  'cloudflare-deploy-owner',
  'github-actions-deploy-boundary',
  'build-runtime-env-split',
  'vite-public-config-boundary',
  'worker-runtime-secret-boundary',
  'd1-binding',
  'r2-binding',
  'auth-workspace-doc',
  'mail-workspace-doc',
  'payment-capability-doc',
  'storage-source-material-doc',
  'env-example-origin',
  'env-example-secret-placeholders',
  'oauth-callback-example',
  'website-mail-sender',
  'website-storage-provider',
  'wrangler-keep-vars',
  'legacy-provider-copy-guard',
] as const;

export type DeveloperConfigurationHandoffItemId =
  (typeof DEVELOPER_CONFIGURATION_HANDOFF_ITEM_IDS)[number];

export type DeveloperConfigurationHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: DeveloperConfigurationHandoffItemId;
  label: string;
  value: string;
};

export type DeveloperConfigurationHandoffEvidence = {
  authDocsLinkConfigurationBoundary: boolean;
  buildRuntimeEnvSplitDocumented: boolean;
  cloudflareDeployOwnershipDocumented: boolean;
  configurationProductLoopDocumented: boolean;
  d1BindingName: string | null;
  envExamplesKeepSecretsBlank: boolean;
  envExamplesUseClassGamifyOrigin: boolean;
  githubActionsDeployAbsent: boolean;
  imageGenerationProviderCopyExcluded: boolean;
  legacyStarterCopyExcluded: boolean;
  mailDocsWorkspaceBoundaryDocumented: boolean;
  oauthCallbackUsesClassGamifyOrigin: boolean;
  paymentDocsCapabilityBoundaryDocumented: boolean;
  r2BindingName: string | null;
  readmeLinksConfigurationBoundary: boolean;
  storageDocsSourceMaterialBoundaryDocumented: boolean;
  vitePublicConfigBoundaryDocumented: boolean;
  websiteConfigMailSenderUsesClassGamify: boolean;
  websiteConfigStorageProviderR2Enabled: boolean;
  workerRuntimeSecretBoundaryDocumented: boolean;
  wranglerKeepVarsEnabled: boolean;
};

export type DeveloperConfigurationHandoffPrivacyContract = {
  documentsBuildTimeValues: true;
  documentsCloudflareDeployOwnership: true;
  documentsRuntimeSecrets: true;
  exposesProviderApiTokens: false;
  exposesRawOauthSecrets: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesTeacherPrivateActivityContent: false;
  itemIds: DeveloperConfigurationHandoffItemId[];
  keepsImageGenerationProviderOut: true;
  keepsLegacyCopyOut: true;
  readsSourceMaterialFileBytes: false;
  scope: 'developer-configuration-boundary';
  usesWorkerBindingsForData: true;
};

export type DeveloperConfigurationHandoffView = {
  description: string;
  itemViews: DeveloperConfigurationHandoffItemView[];
  privacy: DeveloperConfigurationHandoffPrivacyContract;
  title: string;
};

type DeveloperConfigurationHandoffItemContext =
  DeveloperConfigurationHandoffEvidence & {
    id: DeveloperConfigurationHandoffItemId;
  };

export function buildDeveloperConfigurationHandoffView(
  evidence: DeveloperConfigurationHandoffEvidence
): DeveloperConfigurationHandoffView {
  const itemViews = DEVELOPER_CONFIGURATION_HANDOFF_ITEM_IDS.map((id) =>
    buildDeveloperConfigurationHandoffItemView({ ...evidence, id })
  );

  return {
    description: m.developer_configuration_handoff_description(),
    itemViews,
    privacy: buildDeveloperConfigurationHandoffPrivacyContract(itemViews),
    title: m.developer_configuration_handoff_title(),
  };
}

function buildDeveloperConfigurationHandoffItemView(
  context: DeveloperConfigurationHandoffItemContext
): DeveloperConfigurationHandoffItemView {
  const item = buildDeveloperConfigurationHandoffItem(context);

  return {
    ...item,
    ariaLabel: m.developer_configuration_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildDeveloperConfigurationHandoffItem({
  authDocsLinkConfigurationBoundary,
  buildRuntimeEnvSplitDocumented,
  cloudflareDeployOwnershipDocumented,
  configurationProductLoopDocumented,
  d1BindingName,
  envExamplesKeepSecretsBlank,
  envExamplesUseClassGamifyOrigin,
  githubActionsDeployAbsent,
  id,
  imageGenerationProviderCopyExcluded,
  legacyStarterCopyExcluded,
  mailDocsWorkspaceBoundaryDocumented,
  oauthCallbackUsesClassGamifyOrigin,
  paymentDocsCapabilityBoundaryDocumented,
  r2BindingName,
  readmeLinksConfigurationBoundary,
  storageDocsSourceMaterialBoundaryDocumented,
  vitePublicConfigBoundaryDocumented,
  websiteConfigMailSenderUsesClassGamify,
  websiteConfigStorageProviderR2Enabled,
  workerRuntimeSecretBoundaryDocumented,
  wranglerKeepVarsEnabled,
}: DeveloperConfigurationHandoffItemContext): Omit<
  DeveloperConfigurationHandoffItemView,
  'ariaLabel'
> {
  switch (id) {
    case 'readme-boundary-link':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_readme_boundary_link_description(),
        id,
        label: m.developer_configuration_handoff_readme_boundary_link_label(),
        value: readmeLinksConfigurationBoundary
          ? m.developer_configuration_handoff_linked_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'configuration-product-loop':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_configuration_product_loop_description(),
        id,
        label:
          m.developer_configuration_handoff_configuration_product_loop_label(),
        value: configurationProductLoopDocumented
          ? m.developer_configuration_handoff_activity_loop_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'cloudflare-deploy-owner':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_cloudflare_deploy_owner_description(),
        id,
        label:
          m.developer_configuration_handoff_cloudflare_deploy_owner_label(),
        value: cloudflareDeployOwnershipDocumented
          ? m.developer_configuration_handoff_cloudflare_git_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'github-actions-deploy-boundary':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_github_actions_deploy_boundary_description(),
        id,
        label:
          m.developer_configuration_handoff_github_actions_deploy_boundary_label(),
        value: githubActionsDeployAbsent
          ? m.developer_configuration_handoff_absent_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'build-runtime-env-split':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_build_runtime_env_split_description(),
        id,
        label:
          m.developer_configuration_handoff_build_runtime_env_split_label(),
        value: buildRuntimeEnvSplitDocumented
          ? m.developer_configuration_handoff_build_runtime_split_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'vite-public-config-boundary':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_vite_public_config_boundary_description(),
        id,
        label:
          m.developer_configuration_handoff_vite_public_config_boundary_label(),
        value: vitePublicConfigBoundaryDocumented
          ? m.developer_configuration_handoff_vite_public_only_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'worker-runtime-secret-boundary':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_worker_runtime_secret_boundary_description(),
        id,
        label:
          m.developer_configuration_handoff_worker_runtime_secret_boundary_label(),
        value: workerRuntimeSecretBoundaryDocumented
          ? m.developer_configuration_handoff_worker_secrets_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'd1-binding':
      return buildDeveloperConfigurationHandoffStaticItem({
        description: m.developer_configuration_handoff_d1_binding_description(),
        id,
        label: m.developer_configuration_handoff_d1_binding_label(),
        value:
          d1BindingName ?? m.developer_configuration_handoff_missing_value(),
      });
    case 'r2-binding':
      return buildDeveloperConfigurationHandoffStaticItem({
        description: m.developer_configuration_handoff_r2_binding_description(),
        id,
        label: m.developer_configuration_handoff_r2_binding_label(),
        value:
          r2BindingName ?? m.developer_configuration_handoff_missing_value(),
      });
    case 'auth-workspace-doc':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_auth_workspace_doc_description(),
        id,
        label: m.developer_configuration_handoff_auth_workspace_doc_label(),
        value: authDocsLinkConfigurationBoundary
          ? m.developer_configuration_handoff_configuration_linked_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'mail-workspace-doc':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_mail_workspace_doc_description(),
        id,
        label: m.developer_configuration_handoff_mail_workspace_doc_label(),
        value: mailDocsWorkspaceBoundaryDocumented
          ? m.developer_configuration_handoff_workspace_boundary_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'payment-capability-doc':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_payment_capability_doc_description(),
        id,
        label: m.developer_configuration_handoff_payment_capability_doc_label(),
        value: paymentDocsCapabilityBoundaryDocumented
          ? m.developer_configuration_handoff_plan_capabilities_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'storage-source-material-doc':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_storage_source_material_doc_description(),
        id,
        label:
          m.developer_configuration_handoff_storage_source_material_doc_label(),
        value: storageDocsSourceMaterialBoundaryDocumented
          ? m.developer_configuration_handoff_source_material_boundary_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'env-example-origin':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_env_example_origin_description(),
        id,
        label: m.developer_configuration_handoff_env_example_origin_label(),
        value: envExamplesUseClassGamifyOrigin
          ? m.developer_configuration_handoff_classgamify_origin_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'env-example-secret-placeholders':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_env_example_secret_placeholders_description(),
        id,
        label:
          m.developer_configuration_handoff_env_example_secret_placeholders_label(),
        value: envExamplesKeepSecretsBlank
          ? m.developer_configuration_handoff_blank_placeholders_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'oauth-callback-example':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_oauth_callback_example_description(),
        id,
        label: m.developer_configuration_handoff_oauth_callback_example_label(),
        value: oauthCallbackUsesClassGamifyOrigin
          ? m.developer_configuration_handoff_classgamify_callback_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'website-mail-sender':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_website_mail_sender_description(),
        id,
        label: m.developer_configuration_handoff_website_mail_sender_label(),
        value: websiteConfigMailSenderUsesClassGamify
          ? m.developer_configuration_handoff_classgamify_sender_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'website-storage-provider':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_website_storage_provider_description(),
        id,
        label:
          m.developer_configuration_handoff_website_storage_provider_label(),
        value: websiteConfigStorageProviderR2Enabled
          ? m.developer_configuration_handoff_r2_enabled_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'wrangler-keep-vars':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_wrangler_keep_vars_description(),
        id,
        label: m.developer_configuration_handoff_wrangler_keep_vars_label(),
        value: wranglerKeepVarsEnabled
          ? m.developer_configuration_handoff_keep_vars_enabled_value()
          : m.developer_configuration_handoff_needs_review_value(),
      });
    case 'legacy-provider-copy-guard':
      return buildDeveloperConfigurationHandoffStaticItem({
        description:
          m.developer_configuration_handoff_legacy_provider_copy_guard_description(),
        id,
        label:
          m.developer_configuration_handoff_legacy_provider_copy_guard_label(),
        value:
          legacyStarterCopyExcluded && imageGenerationProviderCopyExcluded
            ? m.developer_configuration_handoff_classgamify_only_value()
            : m.developer_configuration_handoff_needs_review_value(),
      });
  }
}

function buildDeveloperConfigurationHandoffStaticItem({
  description,
  id,
  label,
  value,
}: Omit<DeveloperConfigurationHandoffItemView, 'ariaLabel'>) {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildDeveloperConfigurationHandoffPrivacyContract(
  itemViews: DeveloperConfigurationHandoffItemView[]
): DeveloperConfigurationHandoffPrivacyContract {
  return {
    documentsBuildTimeValues: true,
    documentsCloudflareDeployOwnership: true,
    documentsRuntimeSecrets: true,
    exposesProviderApiTokens: false,
    exposesRawOauthSecrets: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    keepsImageGenerationProviderOut: true,
    keepsLegacyCopyOut: true,
    readsSourceMaterialFileBytes: false,
    scope: 'developer-configuration-boundary',
    usesWorkerBindingsForData: true,
  };
}
