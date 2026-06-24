import { getRuntimeItems, type RuntimeItem } from '@/activities/runtime';
import type { ActivityContent, ActivityTemplateType } from '@/activities/types';

export type AssignmentSnapshotSourceActivity = {
  contentJson: ActivityContent;
  description: string | null;
  templateType: ActivityTemplateType;
  title: string;
};

export type AssignmentSnapshotInsert = {
  activityDescription: string | null;
  activityTitle: string;
  assignmentId: string;
  contentJson: ActivityContent;
  createdAt: Date;
  templateType: ActivityTemplateType;
};

export type AssignmentSnapshotFallbackActivity = {
  contentJson?: ActivityContent;
  description: string | null;
  templateType: ActivityTemplateType;
  title: string;
};

export type AssignmentSnapshotFallbackSnapshot = {
  activityDescription: string | null;
  activityTitle: string;
  contentJson?: ActivityContent;
  templateType: ActivityTemplateType;
} | null;

export type ResolvedAssignmentSnapshotSource = {
  activityDescription: string | null;
  activityTitle: string;
  contentJson?: ActivityContent;
  hasSnapshot: boolean;
  templateType: ActivityTemplateType;
};

export type ResolvedAssignmentRuntimeSource =
  ResolvedAssignmentSnapshotSource & {
    contentJson: ActivityContent;
    runtimeItems: RuntimeItem[];
  };

export function buildAssignmentSnapshotInsert({
  assignmentId,
  createdAt,
  sourceActivity,
}: {
  assignmentId: string;
  createdAt: Date;
  sourceActivity: AssignmentSnapshotSourceActivity;
}): AssignmentSnapshotInsert {
  return {
    activityDescription: sourceActivity.description,
    activityTitle: sourceActivity.title,
    assignmentId,
    contentJson: structuredClone(sourceActivity.contentJson),
    createdAt,
    templateType: sourceActivity.templateType,
  };
}

export function resolveAssignmentSnapshotSource({
  activity,
  snapshot,
}: {
  activity: AssignmentSnapshotFallbackActivity;
  snapshot?: AssignmentSnapshotFallbackSnapshot;
}): ResolvedAssignmentSnapshotSource {
  return {
    activityDescription: snapshot
      ? snapshot.activityDescription
      : activity.description,
    activityTitle: snapshot ? snapshot.activityTitle : activity.title,
    contentJson: snapshot?.contentJson ?? activity.contentJson,
    hasSnapshot: Boolean(snapshot),
    templateType: snapshot?.templateType ?? activity.templateType,
  };
}

export function resolveAssignmentRuntimeSource({
  activity,
  snapshot,
}: {
  activity: AssignmentSnapshotFallbackActivity & {
    contentJson: ActivityContent;
  };
  snapshot?:
    | (NonNullable<AssignmentSnapshotFallbackSnapshot> & {
        contentJson: ActivityContent;
      })
    | null;
}): ResolvedAssignmentRuntimeSource {
  const resolvedSource = resolveAssignmentSnapshotSource({
    activity,
    snapshot,
  });
  const contentJson = resolvedSource.contentJson ?? activity.contentJson;

  return {
    ...resolvedSource,
    contentJson,
    runtimeItems: getRuntimeItems(resolvedSource.templateType, contentJson),
  };
}
