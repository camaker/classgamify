import { activityTemplates } from '@/activities/catalog';
import { getTemplateRemixPlan } from '@/activities/template-remix';
import type { ActivityContent, ActivityTemplateType } from '@/activities/types';

export type ActivityLibraryTemplateOption = {
  shortName: string;
  template: ActivityTemplateType;
};

export type ActivityLibraryCardSummary = {
  contentCounts: {
    groups: number;
    pairs: number;
    questions: number;
  };
  lockedTemplateDiagnostics: string[];
  readyTemplateOptions: ActivityLibraryTemplateOption[];
  suggestedTemplateOptions: ActivityLibraryTemplateOption[];
};

export type ActivityLibrarySummarySource = {
  contentJson: ActivityContent;
  templateType: ActivityTemplateType;
  visibility: string;
};

export type ActivityLibrarySummary = {
  archivedActivities: number;
  draftActivities: number;
  remixReadyActivities: number;
  templateCoverage: number;
  templateCoverageTotal: number;
  totalActivities: number;
  totalReadyTemplateOptions: number;
};

export function summarizeActivityLibrary(
  activities: ActivityLibrarySummarySource[]
): ActivityLibrarySummary {
  const templateTypes = new Set<ActivityTemplateType>();
  let archivedActivities = 0;
  let draftActivities = 0;
  let remixReadyActivities = 0;
  let totalReadyTemplateOptions = 0;

  for (const item of activities) {
    templateTypes.add(item.templateType);
    if (item.visibility === 'archived') {
      archivedActivities += 1;
    }
    if (item.visibility === 'draft') {
      draftActivities += 1;
    }

    const cardSummary = buildActivityLibraryCardSummary({
      content: item.contentJson,
      templateType: item.templateType,
    });
    totalReadyTemplateOptions += cardSummary.readyTemplateOptions.length;
    if (cardSummary.suggestedTemplateOptions.length > 0) {
      remixReadyActivities += 1;
    }
  }

  return {
    archivedActivities,
    draftActivities,
    remixReadyActivities,
    templateCoverage: templateTypes.size,
    templateCoverageTotal: activityTemplates.length,
    totalActivities: activities.length,
    totalReadyTemplateOptions,
  };
}

export function buildActivityLibraryCardSummary({
  content,
  templateType,
}: {
  content: ActivityContent;
  templateType: ActivityTemplateType;
}): ActivityLibraryCardSummary {
  const remixPlan = getTemplateRemixPlan({
    content,
    currentTemplateType: templateType,
  });

  return {
    contentCounts: {
      groups: content.groups.length,
      pairs: content.pairs.length,
      questions: content.questions.length,
    },
    lockedTemplateDiagnostics: remixPlan.options
      .filter((option) => !option.isReady)
      .map((option) => option.diagnosis),
    readyTemplateOptions: remixPlan.readyOptions.map((option) => ({
      shortName: option.template.shortName,
      template: option.template.type,
    })),
    suggestedTemplateOptions: remixPlan.suggestedOptions.map((option) => ({
      shortName: option.template.shortName,
      template: option.template.type,
    })),
  };
}
