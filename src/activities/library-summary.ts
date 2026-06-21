import { activityTemplates } from '@/activities/catalog';
import { getTemplateRemixPlan } from '@/activities/template-remix';
import type { ActivityContent, ActivityTemplateType } from '@/activities/types';
import type {
  ActivityLibraryStatus,
  ActivityTemplateFilter,
} from '@/activities/library-filters';

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

export type ActivityLibrarySummaryMetricId =
  | 'total'
  | 'coverage'
  | 'remix'
  | 'readyModes';

export type ActivityLibrarySummaryMetric = {
  id: ActivityLibrarySummaryMetricId;
  label: string;
  value: string;
};

export function buildActivityLibraryFilterSummary({
  isLoading,
  search,
  status,
  template,
  total,
}: {
  isLoading: boolean;
  search?: string;
  status: ActivityLibraryStatus;
  template: ActivityTemplateFilter;
  total: number;
}) {
  const hasFilters = Boolean(search) || template !== 'all';
  if (hasFilters) {
    return {
      hasFilters,
      text: isLoading
        ? 'Filtering activities...'
        : `${total} ${total === 1 ? 'match' : 'matches'}`,
    };
  }

  const statusLabel = status === 'archived' ? 'archived' : 'saved';

  return {
    hasFilters,
    text: isLoading
      ? 'Loading activities...'
      : `${total} ${statusLabel} ${total === 1 ? 'activity' : 'activities'}`,
  };
}

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

export function buildActivityLibrarySummaryMetrics({
  hasFilters,
  summary,
  totalActivities,
}: {
  hasFilters: boolean;
  summary?: ActivityLibrarySummary;
  totalActivities: number;
}): ActivityLibrarySummaryMetric[] {
  const resolvedSummary = summary ?? {
    archivedActivities: 0,
    draftActivities: 0,
    remixReadyActivities: 0,
    templateCoverage: 0,
    templateCoverageTotal: activityTemplates.length,
    totalActivities,
    totalReadyTemplateOptions: 0,
  };

  return [
    {
      id: 'total',
      label: hasFilters ? 'Matching activities' : 'Activities',
      value: String(resolvedSummary.totalActivities),
    },
    {
      id: 'coverage',
      label: 'Template coverage',
      value: `${resolvedSummary.templateCoverage}/${resolvedSummary.templateCoverageTotal}`,
    },
    {
      id: 'remix',
      label: 'Ready to remix',
      value: String(resolvedSummary.remixReadyActivities),
    },
    {
      id: 'readyModes',
      label: 'Ready modes',
      value: String(resolvedSummary.totalReadyTemplateOptions),
    },
  ];
}
