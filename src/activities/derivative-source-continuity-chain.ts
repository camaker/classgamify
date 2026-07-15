import { ACTIVITY_DERIVATIVE_SOURCE_WRITE_GUARD_STAGES } from '@/activities/derivative-source-write';

export const ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_STAGES =
  ACTIVITY_DERIVATIVE_SOURCE_WRITE_GUARD_STAGES;

export const ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/db.md',
  'src/activities/derivative-source-write.ts',
  'src/lib/error-text.ts',
  'src/activities/lifecycle.ts',
  'src/activities/source-material-integrity.ts',
  'src/activities/activity-mutation-continuity-chain.ts',
  'src/activities/duplicate.ts',
  'src/activities/template-remix.ts',
  'src/activities/persistence.ts',
  'src/activities/detail-query.ts',
  'src/api/activities.ts',
  'src/activities/activity-lifecycle-governance-chain.ts',
  'src/activities/authoring-library-chain.ts',
  'src/activities/editor.ts',
  'src/activities/draft-source.ts',
  'src/activities/types.ts',
  'src/activities/validation.ts',
  'src/assignments/publish-source-continuity-chain.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/public.ts',
  'src/components/activities/activity-library-card.tsx',
  'src/components/activities/activity-create-form.tsx',
  'src/components/activities/activity-editor-shell.tsx',
  'src/components/activities/activity-template-readiness-panel.tsx',
  'src/db/app.schema.ts',
  'src/db/migrations/0013_activity_derivative_source_guard.sql',
  'scripts/activity-derivative-source-write-guard-contract.test.ts',
  'tests/e2e/specs/activity-authoring.spec.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ActivityDerivativeSourceContinuityChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesActivityContent: false;
  exposesDerivationProvenance: false;
  exposesInternalTriggerMarkers: false;
  exposesSourceMaterialMetadata: false;
  exposesTeacherOwnerIds: false;
  itemIds: string[];
  preservesIndependentDerivativeDrafts: true;
  sourceFiles: string[];
  usesExactSourceRevision: true;
  usesOwnerScopedSourceRead: true;
  usesWriteTimeProvenanceGuard: true;
};

export function buildActivityDerivativeSourceContinuityChainView() {
  const itemViews = ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_STAGES.map(
    (stage) => {
      const label = stage.id
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
      const value = `${stage.layer} boundary`;
      return {
        ariaLabel: `${label}: ${value}`,
        description: `${label} stays aligned from duplicate or remix intent through write-time provenance guards, independent draft persistence, future publishing, and privacy.`,
        id: stage.id,
        label,
        value,
      };
    }
  );

  const privacy: ActivityDerivativeSourceContinuityChainPrivacyContract = {
    chainSourceFileCount:
      ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_SOURCE_FILES.length,
    exposesActivityContent: false,
    exposesDerivationProvenance: false,
    exposesInternalTriggerMarkers: false,
    exposesSourceMaterialMetadata: false,
    exposesTeacherOwnerIds: false,
    itemIds: ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_STAGES.map(
      (stage) => stage.id
    ),
    preservesIndependentDerivativeDrafts: true,
    sourceFiles: [...ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_SOURCE_FILES],
    usesExactSourceRevision: true,
    usesOwnerScopedSourceRead: true,
    usesWriteTimeProvenanceGuard: true,
  };

  return {
    description:
      'Thirty-slice activity derivative source continuity chain from owner-scoped duplicate and remix reads through exact provenance guards, independent draft persistence, later source changes, future publishing, and privacy.',
    itemViews,
    privacy,
    title: 'Activity derivative source continuity chain',
  };
}
