import { activityTemplates } from '@/activities/catalog';
import { getTemplateRemixPlan } from '@/activities/template-remix';
import type { ActivityContent, ActivityTemplateType } from '@/activities/types';

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

    const remixPlan = getTemplateRemixPlan({
      content: item.contentJson,
      currentTemplateType: item.templateType,
    });
    totalReadyTemplateOptions += remixPlan.readyOptions.length;
    if (remixPlan.suggestedOptions.length > 0) {
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
