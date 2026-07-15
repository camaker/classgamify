import { ACTIVITY_SOURCE_MATERIAL_WRITE_STAGES } from '@/activities/source-material-write';

export const ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_STAGES =
  ACTIVITY_SOURCE_MATERIAL_WRITE_STAGES;

export const ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/db.md',
  'src/activities/source-material-write.ts',
  'src/activities/material-references.ts',
  'src/activities/types.ts',
  'src/activities/validation.ts',
  'src/api/activities.ts',
  'src/storage/file-query.ts',
  'src/storage/user-file-response.ts',
  'src/activities/source-material-integrity.ts',
  'src/activities/source-material-privacy-chain.ts',
  'src/activities/source-extraction-lifecycle-chain.ts',
  'src/activities/authoring-library-chain.ts',
  'src/activities/editor.ts',
  'src/activities/persistence.ts',
  'src/activities/activity-mutation-continuity-chain.ts',
  'src/activities/derivative-source-continuity-chain.ts',
  'src/assignments/publish-source-continuity-chain.ts',
  'src/assignments/snapshot.ts',
  'src/components/activities/activity-source-materials-field.tsx',
  'src/components/activities/activity-source-materials-summary.tsx',
  'src/components/activities/activity-create-form.tsx',
  'src/components/activities/activity-editor-fields.tsx',
  'src/db/app.schema.ts',
  'scripts/activity-source-material-write-contract.test.ts',
  'scripts/activity-source-material-reference-boundary.test.ts',
  'tests/e2e/specs/activity-authoring.spec.ts',
  'project.inlang/messages/en.json',
  'project.inlang/messages/zh.json',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export function buildActivitySourceMaterialWriteContinuityChainView() {
  const itemViews = ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_STAGES.map(
    (stage) => {
      const label = stage.id
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
      return {
        ariaLabel: `${label}: ${stage.layer} boundary`,
        description: `${label} stays aligned from teacher material selection through owner-scoped metadata resolution, activity persistence, derivative and publish boundaries, and privacy.`,
        id: stage.id,
        label,
        value: `${stage.layer} boundary`,
      };
    }
  );
  return {
    description:
      'Thirty-slice activity source-material write continuity chain from normalized teacher references through owner-scoped batch lookup, authoritative metadata rebuild, all-or-nothing create and edit persistence, derivative and publish boundaries, and privacy.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_SOURCE_FILES.length,
      exposesFileBytes: false as const,
      exposesOtherOwnerRows: false as const,
      exposesPermissionMetadata: false as const,
      exposesR2Keys: false as const,
      itemIds: ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_STAGES.map(
        (stage) => stage.id
      ),
      sourceFiles: [
        ...ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_SOURCE_FILES,
      ],
      usesAllOrNothingResolution: true as const,
      usesAuthoritativeMetadata: true as const,
      usesOwnerScopedBatchRead: true as const,
      usesSingleBatchQuery: true as const,
    },
    title: 'Activity source material write continuity chain',
  };
}
