import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';
import type { PageDoc } from '@/lib/pages';

export const LEGAL_POLICY_PAGE_IDS = ['terms', 'privacy', 'cookie'] as const;

export type LegalPolicyPageId = (typeof LEGAL_POLICY_PAGE_IDS)[number];

export const LEGAL_POLICY_HANDOFF_ITEM_IDS = [
  'policy-set',
  'current-policy',
  'current-route',
  'content-source',
  'seo-description',
  'updated-date',
  'classgamify-product-boundary',
  'activity-content-model',
  'assignment-link-model',
  'assignment-snapshot-model',
  'student-attempt-model',
  'teacher-results-model',
  'csv-export-model',
  'source-material-model',
  'ai-draft-model',
  'configured-ai-provider',
  'image-generation-provider-guard',
  'payment-provider-scope',
  'auth-provider-scope',
  'storage-provider-scope',
  'analytics-provider-scope',
  'cookie-storage-scope',
  'anonymous-token-boundary',
  'answer-key-boundary',
  'student-sensitive-data-warning',
  'school-authority-boundary',
  'retention-and-deletion',
  'third-party-provider-boundary',
  'legacy-copy-guard',
  'privacy-guard',
] as const;

export type LegalPolicyHandoffItemId =
  (typeof LEGAL_POLICY_HANDOFF_ITEM_IDS)[number];

export type LegalPolicyHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: LegalPolicyHandoffItemId;
  label: string;
  value: string;
};

type LegalPolicyHandoffPrivacyContract = {
  createsAssignmentLinks: false;
  describesAiDraftDataModel: true;
  describesAssignmentSnapshots: true;
  describesPublicAssignmentLinks: true;
  describesStudentAttempts: true;
  describesTeacherActivities: true;
  describesTeacherResults: true;
  exposesAnswerKeys: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesTeacherPrivateActivityContent: false;
  itemIds: LegalPolicyHandoffItemId[];
  keepsLegacyCopyOut: true;
  scope: 'public-legal-policy-product-boundary';
};

export type LegalPolicyHandoffView = {
  description: string;
  itemViews: LegalPolicyHandoffItemView[];
  privacy: LegalPolicyHandoffPrivacyContract;
  title: string;
};

export type LegalPolicyPageViewModel = {
  handoffView: LegalPolicyHandoffView;
  page: PageDoc;
  policyId: LegalPolicyPageId;
};

type LegalPolicyPageConfig = {
  route: string;
};

const LEGAL_POLICY_PAGE_CONFIG = {
  cookie: {
    route: Routes.CookiePolicy,
  },
  privacy: {
    route: Routes.PrivacyPolicy,
  },
  terms: {
    route: Routes.TermsOfService,
  },
} as const satisfies Record<LegalPolicyPageId, LegalPolicyPageConfig>;

export function buildLegalPolicyPageViewModel({
  page,
  policyId,
}: {
  page: PageDoc;
  policyId: LegalPolicyPageId;
}): LegalPolicyPageViewModel {
  return {
    handoffView: buildLegalPolicyHandoffView({ page, policyId }),
    page,
    policyId,
  };
}

function buildLegalPolicyHandoffView({
  page,
  policyId,
}: {
  page: PageDoc;
  policyId: LegalPolicyPageId;
}): LegalPolicyHandoffView {
  const context = buildLegalPolicyHandoffContext({ page, policyId });
  const itemViews = LEGAL_POLICY_HANDOFF_ITEM_IDS.map((id) =>
    buildLegalPolicyHandoffItemView({ ...context, id })
  );

  return {
    description: m.legal_policy_handoff_description(),
    itemViews,
    privacy: buildLegalPolicyHandoffPrivacyContract(itemViews),
    title: m.legal_policy_handoff_title(),
  };
}

type LegalPolicyHandoffContext = {
  page: PageDoc;
  policyId: LegalPolicyPageId;
  route: string;
};

type LegalPolicyHandoffItemContext = LegalPolicyHandoffContext & {
  id: LegalPolicyHandoffItemId;
};

function buildLegalPolicyHandoffContext({
  page,
  policyId,
}: {
  page: PageDoc;
  policyId: LegalPolicyPageId;
}): LegalPolicyHandoffContext {
  return {
    page,
    policyId,
    route: LEGAL_POLICY_PAGE_CONFIG[policyId].route,
  };
}

function buildLegalPolicyHandoffItemView(
  context: LegalPolicyHandoffItemContext
): LegalPolicyHandoffItemView {
  const item = buildLegalPolicyHandoffItem(context);

  return {
    ...item,
    ariaLabel: m.legal_policy_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildLegalPolicyHandoffItem({
  id,
  page,
  route,
}: LegalPolicyHandoffItemContext): Omit<
  LegalPolicyHandoffItemView,
  'ariaLabel'
> {
  switch (id) {
    case 'policy-set':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_policy_set_description(),
        id,
        label: m.legal_policy_handoff_policy_set_label(),
        value: m.legal_policy_handoff_policy_set_value({
          count: String(LEGAL_POLICY_PAGE_IDS.length),
        }),
      });
    case 'current-policy':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_current_policy_description(),
        id,
        label: m.legal_policy_handoff_current_policy_label(),
        value: page.title,
      });
    case 'current-route':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_current_route_description(),
        id,
        label: m.legal_policy_handoff_current_route_label(),
        value: route,
      });
    case 'content-source':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_content_source_description(),
        id,
        label: m.legal_policy_handoff_content_source_label(),
        value: m.legal_policy_handoff_content_source_value(),
      });
    case 'seo-description':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_seo_description_description(),
        id,
        label: m.legal_policy_handoff_seo_description_label(),
        value: page.description
          ? m.legal_policy_handoff_configured_value()
          : m.legal_policy_handoff_needs_review_value(),
      });
    case 'updated-date':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_updated_date_description(),
        id,
        label: m.legal_policy_handoff_updated_date_label(),
        value: page.date ?? m.legal_policy_handoff_needs_review_value(),
      });
    case 'classgamify-product-boundary':
      return buildLegalPolicyContentStatusItem({
        description:
          m.legal_policy_handoff_classgamify_product_boundary_description(),
        id,
        label: m.legal_policy_handoff_classgamify_product_boundary_label(),
        page,
        terms: ['classgamify'],
      });
    case 'activity-content-model':
      return buildLegalPolicyContentStatusItem({
        description:
          m.legal_policy_handoff_activity_content_model_description(),
        id,
        label: m.legal_policy_handoff_activity_content_model_label(),
        page,
        terms: ['activity', 'activities', '活动'],
      });
    case 'assignment-link-model':
      return buildLegalPolicyContentStatusItem({
        description: m.legal_policy_handoff_assignment_link_model_description(),
        id,
        label: m.legal_policy_handoff_assignment_link_model_label(),
        page,
        terms: ['assignment link', 'assignment links', '作业链接'],
      });
    case 'assignment-snapshot-model':
      return buildLegalPolicyContentStatusItem({
        description:
          m.legal_policy_handoff_assignment_snapshot_model_description(),
        id,
        label: m.legal_policy_handoff_assignment_snapshot_model_label(),
        page,
        terms: ['snapshot', 'snapshots', '快照'],
      });
    case 'student-attempt-model':
      return buildLegalPolicyContentStatusItem({
        description: m.legal_policy_handoff_student_attempt_model_description(),
        id,
        label: m.legal_policy_handoff_student_attempt_model_label(),
        page,
        terms: ['attempt', 'attempts', '尝试', '作答'],
      });
    case 'teacher-results-model':
      return buildLegalPolicyContentStatusItem({
        description: m.legal_policy_handoff_teacher_results_model_description(),
        id,
        label: m.legal_policy_handoff_teacher_results_model_label(),
        page,
        terms: ['result', 'results', '结果'],
      });
    case 'csv-export-model':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_csv_export_model_description(),
        id,
        label: m.legal_policy_handoff_csv_export_model_label(),
        value: m.legal_policy_handoff_teacher_results_value(),
      });
    case 'source-material-model':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_source_material_model_description(),
        id,
        label: m.legal_policy_handoff_source_material_model_label(),
        value: m.legal_policy_handoff_owner_scoped_value(),
      });
    case 'ai-draft-model':
      return buildLegalPolicyContentStatusItem({
        description: m.legal_policy_handoff_ai_draft_model_description(),
        id,
        label: m.legal_policy_handoff_ai_draft_model_label(),
        page,
        terms: ['ai', 'AI'],
      });
    case 'configured-ai-provider':
      return buildLegalPolicyContentStatusItem({
        description:
          m.legal_policy_handoff_configured_ai_provider_description(),
        id,
        label: m.legal_policy_handoff_configured_ai_provider_label(),
        page,
        terms: ['workers ai', 'Workers AI'],
      });
    case 'image-generation-provider-guard':
      return buildLegalPolicyHandoffStaticItem({
        description:
          m.legal_policy_handoff_image_generation_provider_guard_description(),
        id,
        label: m.legal_policy_handoff_image_generation_provider_guard_label(),
        value: pageContainsAny(page, ['image generation', '图像生成'])
          ? m.legal_policy_handoff_needs_review_value()
          : m.legal_policy_handoff_excluded_value(),
      });
    case 'payment-provider-scope':
      return buildLegalPolicyHandoffStaticItem({
        description:
          m.legal_policy_handoff_payment_provider_scope_description(),
        id,
        label: m.legal_policy_handoff_payment_provider_scope_label(),
        value: m.legal_policy_handoff_creem_stripe_value(),
      });
    case 'auth-provider-scope':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_auth_provider_scope_description(),
        id,
        label: m.legal_policy_handoff_auth_provider_scope_label(),
        value: m.legal_policy_handoff_better_auth_google_value(),
      });
    case 'storage-provider-scope':
      return buildLegalPolicyHandoffStaticItem({
        description:
          m.legal_policy_handoff_storage_provider_scope_description(),
        id,
        label: m.legal_policy_handoff_storage_provider_scope_label(),
        value: m.legal_policy_handoff_cloudflare_r2_value(),
      });
    case 'analytics-provider-scope':
      return buildLegalPolicyHandoffStaticItem({
        description:
          m.legal_policy_handoff_analytics_provider_scope_description(),
        id,
        label: m.legal_policy_handoff_analytics_provider_scope_label(),
        value: m.legal_policy_handoff_configured_providers_value(),
      });
    case 'cookie-storage-scope':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_cookie_storage_scope_description(),
        id,
        label: m.legal_policy_handoff_cookie_storage_scope_label(),
        value: m.legal_policy_handoff_browser_storage_value(),
      });
    case 'anonymous-token-boundary':
      return buildLegalPolicyHandoffStaticItem({
        description:
          m.legal_policy_handoff_anonymous_token_boundary_description(),
        id,
        label: m.legal_policy_handoff_anonymous_token_boundary_label(),
        value: m.legal_policy_handoff_raw_tokens_hidden_value(),
      });
    case 'answer-key-boundary':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_answer_key_boundary_description(),
        id,
        label: m.legal_policy_handoff_answer_key_boundary_label(),
        value: m.legal_policy_handoff_teacher_only_value(),
      });
    case 'student-sensitive-data-warning':
      return buildLegalPolicyHandoffStaticItem({
        description:
          m.legal_policy_handoff_student_sensitive_data_warning_description(),
        id,
        label: m.legal_policy_handoff_student_sensitive_data_warning_label(),
        value: m.legal_policy_handoff_classroom_only_value(),
      });
    case 'school-authority-boundary':
      return buildLegalPolicyHandoffStaticItem({
        description:
          m.legal_policy_handoff_school_authority_boundary_description(),
        id,
        label: m.legal_policy_handoff_school_authority_boundary_label(),
        value: m.legal_policy_handoff_teacher_authority_value(),
      });
    case 'retention-and-deletion':
      return buildLegalPolicyHandoffStaticItem({
        description:
          m.legal_policy_handoff_retention_and_deletion_description(),
        id,
        label: m.legal_policy_handoff_retention_and_deletion_label(),
        value: m.legal_policy_handoff_documented_value(),
      });
    case 'third-party-provider-boundary':
      return buildLegalPolicyHandoffStaticItem({
        description:
          m.legal_policy_handoff_third_party_provider_boundary_description(),
        id,
        label: m.legal_policy_handoff_third_party_provider_boundary_label(),
        value: m.legal_policy_handoff_provider_terms_value(),
      });
    case 'legacy-copy-guard':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_legacy_copy_guard_description(),
        id,
        label: m.legal_policy_handoff_legacy_copy_guard_label(),
        value: legalPolicyLegacyCopyIsExcluded(page)
          ? m.legal_policy_handoff_classgamify_only_value()
          : m.legal_policy_handoff_needs_review_value(),
      });
    case 'privacy-guard':
      return buildLegalPolicyHandoffStaticItem({
        description: m.legal_policy_handoff_privacy_guard_description(),
        id,
        label: m.legal_policy_handoff_privacy_guard_label(),
        value: m.legal_policy_handoff_private_data_hidden_value(),
      });
  }
}

function buildLegalPolicyContentStatusItem({
  description,
  id,
  label,
  page,
  terms,
}: {
  description: string;
  id: LegalPolicyHandoffItemId;
  label: string;
  page: PageDoc;
  terms: string[];
}) {
  return buildLegalPolicyHandoffStaticItem({
    description,
    id,
    label,
    value: pageContainsAny(page, terms)
      ? m.legal_policy_handoff_covered_value()
      : m.legal_policy_handoff_needs_review_value(),
  });
}

function buildLegalPolicyHandoffStaticItem({
  description,
  id,
  label,
  value,
}: Omit<LegalPolicyHandoffItemView, 'ariaLabel'>) {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildLegalPolicyHandoffPrivacyContract(
  itemViews: LegalPolicyHandoffItemView[]
): LegalPolicyHandoffPrivacyContract {
  return {
    createsAssignmentLinks: false,
    describesAiDraftDataModel: true,
    describesAssignmentSnapshots: true,
    describesPublicAssignmentLinks: true,
    describesStudentAttempts: true,
    describesTeacherActivities: true,
    describesTeacherResults: true,
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds: itemViews.map((item) => item.id),
    keepsLegacyCopyOut: true,
    scope: 'public-legal-policy-product-boundary',
  };
}

function pageContainsAny(page: PageDoc, terms: string[]) {
  const haystack = `${page.title}\n${page.description ?? ''}\n${page.content}`;
  const lowerHaystack = haystack.toLocaleLowerCase();

  return terms.some((term) => lowerHaystack.includes(term.toLocaleLowerCase()));
}

function legalPolicyLegacyCopyIsExcluded(page: PageDoc) {
  return !pageContainsAny(page, [
    'hanzi',
    'hsk',
    'lang study',
    'learning-site',
    'template saas',
  ]);
}
