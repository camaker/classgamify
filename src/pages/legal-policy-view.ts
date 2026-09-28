import type { PageDoc } from '@/lib/pages';

const LEGAL_POLICY_PAGE_IDS = ['terms', 'privacy', 'cookie'] as const;

type LegalPolicyPageId = (typeof LEGAL_POLICY_PAGE_IDS)[number];

type LegalPolicyPageViewModel = {
  page: PageDoc;
  policyId: LegalPolicyPageId;
};

export function buildLegalPolicyPageViewModel({
  page,
  policyId,
}: {
  page: PageDoc;
  policyId: LegalPolicyPageId;
}): LegalPolicyPageViewModel {
  return {
    page,
    policyId,
  };
}
