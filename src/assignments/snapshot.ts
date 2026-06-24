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
    contentJson: sourceActivity.contentJson,
    createdAt,
    templateType: sourceActivity.templateType,
  };
}
