import type { AssignmentSettings, AssignmentStatus } from '@/activities/types';
import {
  buildAssignmentSnapshotInsert,
  type AssignmentSnapshotInsert,
  type AssignmentSnapshotSourceActivity,
} from '@/assignments/snapshot';

type PublishedAssignmentInsert = {
  activityId: string;
  createdAt: Date;
  expiresAt: Date | null;
  id: string;
  ownerId: string;
  settingsJson: AssignmentSettings;
  shareSlug: string;
  status: AssignmentStatus;
  title: string;
  updatedAt: Date;
};

export function buildPublishedAssignmentInsert({
  expiresAt,
  id,
  now,
  settings,
  shareSlug,
  sourceActivity,
  title,
  userId,
}: {
  expiresAt: Date | null;
  id: string;
  now: Date;
  settings: AssignmentSettings;
  shareSlug: string;
  sourceActivity: {
    id: string;
  };
  title: string;
  userId: string;
}): PublishedAssignmentInsert {
  return {
    activityId: sourceActivity.id,
    createdAt: now,
    expiresAt,
    id,
    ownerId: userId,
    settingsJson: settings,
    shareSlug,
    status: 'published',
    title,
    updatedAt: now,
  };
}

export function buildPublishedAssignmentSnapshotInsert({
  assignmentId,
  createdAt,
  sourceActivity,
}: {
  assignmentId: string;
  createdAt: Date;
  sourceActivity: AssignmentSnapshotSourceActivity;
}): AssignmentSnapshotInsert {
  return buildAssignmentSnapshotInsert({
    assignmentId,
    createdAt,
    sourceActivity,
  });
}
