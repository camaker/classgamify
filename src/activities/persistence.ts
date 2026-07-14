import {
  buildDuplicatedActivityTitle,
  buildRemixedActivityTitle,
  cloneActivityContentForDerivative,
} from '@/activities/duplicate';
import type {
  ActivityContent,
  ActivityTemplateDefinition,
  ActivityTemplateType,
  ActivityVisibility,
} from '@/activities/types';
import {
  buildActivityContent,
  type CreateActivityInput,
} from '@/activities/validation';

type ActivityInsertPayload = {
  contentJson: ActivityContent;
  createdAt: Date;
  derivationSourceActivityId: string | null;
  derivationSourceUpdatedAt: Date | null;
  description: string | null;
  id: string;
  ownerId: string;
  templateType: ActivityTemplateType;
  title: string;
  updatedAt: Date;
  visibility: ActivityVisibility;
};

type ActivityUpdatePayload = {
  contentJson: ActivityContent;
  description: string | null;
  templateType: ActivityTemplateType;
  title: string;
  updatedAt: Date;
  visibility: ActivityVisibility;
};

type ActivityVisibilityUpdatePayload = {
  updatedAt: Date;
  visibility: ActivityVisibility;
};

type PersistedActivityDerivativeSource = {
  contentJson: ActivityContent;
  description: string | null;
  id: string;
  templateType: ActivityTemplateType;
  title: string;
  updatedAt: Date;
};

export function buildActivityCreateInsert({
  id,
  input,
  now,
  userId,
}: {
  id: string;
  input: CreateActivityInput;
  now: Date;
  userId: string;
}): ActivityInsertPayload {
  return {
    contentJson: buildActivityContent(input),
    createdAt: now,
    derivationSourceActivityId: null,
    derivationSourceUpdatedAt: null,
    description: normalizeActivityDescription(input.description),
    id,
    ownerId: userId,
    templateType: input.templateType,
    title: input.title,
    updatedAt: now,
    visibility: input.visibility,
  };
}

export function buildActivityUpdateSet({
  input,
  now,
}: {
  input: CreateActivityInput;
  now: Date;
}): ActivityUpdatePayload {
  return {
    contentJson: buildActivityContent(input),
    description: normalizeActivityDescription(input.description),
    templateType: input.templateType,
    title: input.title,
    updatedAt: now,
    visibility: input.visibility,
  };
}

export function buildActivityVisibilityUpdateSet({
  nextVisibility,
  updatedAt,
}: {
  nextVisibility: ActivityVisibility;
  updatedAt: Date;
}): ActivityVisibilityUpdatePayload {
  return {
    updatedAt,
    visibility: nextVisibility,
  };
}

export function buildDuplicatedActivityInsert({
  id,
  now,
  sourceActivity,
  userId,
}: {
  id: string;
  now: Date;
  sourceActivity: PersistedActivityDerivativeSource;
  userId: string;
}): ActivityInsertPayload {
  return {
    contentJson: cloneActivityContentForDerivative(sourceActivity.contentJson),
    createdAt: now,
    derivationSourceActivityId: sourceActivity.id,
    derivationSourceUpdatedAt: sourceActivity.updatedAt,
    description: sourceActivity.description,
    id,
    ownerId: userId,
    templateType: sourceActivity.templateType,
    title: buildDuplicatedActivityTitle(sourceActivity.title),
    updatedAt: now,
    visibility: 'draft',
  };
}

export function buildRemixedActivityInsert({
  id,
  now,
  sourceActivity,
  targetTemplate,
  userId,
}: {
  id: string;
  now: Date;
  sourceActivity: PersistedActivityDerivativeSource;
  targetTemplate: Pick<ActivityTemplateDefinition, 'shortName' | 'type'>;
  userId: string;
}): ActivityInsertPayload {
  return {
    contentJson: cloneActivityContentForDerivative(sourceActivity.contentJson),
    createdAt: now,
    derivationSourceActivityId: sourceActivity.id,
    derivationSourceUpdatedAt: sourceActivity.updatedAt,
    description: sourceActivity.description,
    id,
    ownerId: userId,
    templateType: targetTemplate.type,
    title: buildRemixedActivityTitle({
      sourceTitle: sourceActivity.title,
      targetShortName: targetTemplate.shortName,
    }),
    updatedAt: now,
    visibility: 'draft',
  };
}

function normalizeActivityDescription(value: string | undefined) {
  return value?.trim() || null;
}
