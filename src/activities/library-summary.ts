import {
  buildTemplateRemixSummary,
  getTemplateRemixPlan,
} from '@/activities/template-remix';
import type { TemplateRemixTemplateOption } from '@/activities/template-remix';
import {
  ACTIVITY_TEMPLATE_TYPES,
  type ActivityContent,
  type ActivityTemplateType,
} from '@/activities/types';
import {
  type ActivitySourceMaterialReadinessCapability,
  summarizeActivitySourceMaterials,
} from '@/activities/material-summary';
import type {
  ActivityLibraryStatus,
  ActivitySourceMaterialFilter,
  ActivityTemplateFilter,
} from '@/activities/library-filters';
import { m } from '@/locale/paraglide/messages';

export type ActivityLibraryTemplateOption = TemplateRemixTemplateOption;

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

type ActivityLibrarySummarySource = {
  contentJson: ActivityContent;
  templateType: ActivityTemplateType;
  visibility: string;
};

export type ActivityLibrarySummary = {
  archivedActivities: number;
  draftActivities: number;
  extractableSourceActivities: number;
  sourceMaterialCapabilityCounts: Record<
    ActivitySourceMaterialReadinessCapability,
    number
  >;
  remixReadyActivities: number;
  templateCoverage: number;
  templateCoverageTotal: number;
  totalActivities: number;
  totalExtractableSourceMaterials: number;
  totalReadyTemplateOptions: number;
};

export type ActivityLibrarySummaryMetricId =
  | 'total'
  | 'coverage'
  | 'remix'
  | 'sourceExtraction';

export type ActivityLibrarySummaryMetric = {
  description?: string;
  id: ActivityLibrarySummaryMetricId;
  label: string;
  value: string;
};

export type ActivityLibrarySourceCapabilityMetric = {
  capability: ActivitySourceMaterialReadinessCapability;
  label: string;
  value: string;
};

export type ActivityLibraryFilterSummary = {
  hasFilters: boolean;
  text: string;
};

export function buildActivityLibraryFilterSummary({
  isLoading,
  search,
  source = 'all',
  status,
  template,
  total,
}: {
  isLoading: boolean;
  search?: string;
  source?: ActivitySourceMaterialFilter;
  status: ActivityLibraryStatus;
  template: ActivityTemplateFilter;
  total: number;
}): ActivityLibraryFilterSummary {
  const hasFilters = Boolean(search) || source !== 'all' || template !== 'all';
  if (hasFilters) {
    return {
      hasFilters,
      text: isLoading
        ? m.activity_library_filter_summary_filtering()
        : total === 1
          ? m.activity_library_filter_summary_matches_one({ count: total })
          : m.activity_library_filter_summary_matches_many({ count: total }),
    };
  }

  const statusLabel =
    status === 'archived'
      ? m.activity_library_filter_summary_status_archived()
      : m.activity_library_filter_summary_status_saved();

  return {
    hasFilters,
    text: isLoading
      ? m.activity_library_filter_summary_loading()
      : total === 1
        ? m.activity_library_filter_summary_total_one({
            count: total,
            status: statusLabel,
          })
        : m.activity_library_filter_summary_total_many({
            count: total,
            status: statusLabel,
          }),
  };
}

export function summarizeActivityLibrary(
  activities: ActivityLibrarySummarySource[]
): ActivityLibrarySummary {
  const templateTypes = new Set<ActivityTemplateType>();
  let archivedActivities = 0;
  let draftActivities = 0;
  let extractableSourceActivities = 0;
  let remixReadyActivities = 0;
  const sourceMaterialCapabilityCounts =
    createEmptySourceMaterialCapabilityCounts();
  let totalExtractableSourceMaterials = 0;
  let totalReadyTemplateOptions = 0;

  for (const item of activities) {
    templateTypes.add(item.templateType);
    if (item.visibility === 'archived') {
      archivedActivities += 1;
    }
    if (item.visibility === 'draft') {
      draftActivities += 1;
    }

    const sourceMaterialSummary = summarizeActivitySourceMaterials(
      item.contentJson.sourceMaterials
    );
    if (sourceMaterialSummary.readiness.extractableCount > 0) {
      extractableSourceActivities += 1;
    }
    totalExtractableSourceMaterials +=
      sourceMaterialSummary.readiness.extractableCount;
    for (const capability of sourceMaterialSummary.readiness.capabilities) {
      sourceMaterialCapabilityCounts[capability] += 1;
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
    extractableSourceActivities,
    sourceMaterialCapabilityCounts,
    remixReadyActivities,
    templateCoverage: templateTypes.size,
    templateCoverageTotal: ACTIVITY_TEMPLATE_TYPES.length,
    totalActivities: activities.length,
    totalExtractableSourceMaterials,
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
  const remixSummary = buildTemplateRemixSummary(remixPlan);

  return {
    contentCounts: {
      groups: content.groups.length,
      pairs: content.pairs.length,
      questions: content.questions.length,
    },
    lockedTemplateDiagnostics: remixSummary.lockedTemplateDiagnostics,
    readyTemplateOptions: remixSummary.readyTemplateOptions,
    suggestedTemplateOptions: remixSummary.suggestedTemplateOptions,
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
    extractableSourceActivities: 0,
    sourceMaterialCapabilityCounts: createEmptySourceMaterialCapabilityCounts(),
    remixReadyActivities: 0,
    templateCoverage: 0,
    templateCoverageTotal: ACTIVITY_TEMPLATE_TYPES.length,
    totalActivities,
    totalExtractableSourceMaterials: 0,
    totalReadyTemplateOptions: 0,
  };

  return [
    {
      id: 'total',
      label: hasFilters
        ? m.activity_library_summary_matching_activities()
        : m.activity_library_summary_activities(),
      value: formatActivityLibraryMetricNumber(resolvedSummary.totalActivities),
    },
    {
      id: 'coverage',
      label: m.activity_library_summary_template_coverage(),
      value: formatActivityLibraryMetricFraction(
        resolvedSummary.templateCoverage,
        resolvedSummary.templateCoverageTotal
      ),
    },
    {
      id: 'remix',
      label: m.activity_library_summary_ready_to_remix(),
      value: formatActivityLibraryMetricNumber(
        resolvedSummary.remixReadyActivities
      ),
    },
    {
      id: 'sourceExtraction',
      label: m.activity_library_summary_source_extraction(),
      description:
        formatActivityLibrarySourceExtractionDescription(resolvedSummary),
      value: formatActivityLibraryMetricNumber(
        resolvedSummary.totalExtractableSourceMaterials
      ),
    },
  ];
}

export function buildActivityLibrarySourceCapabilityMetrics(
  summary?: ActivityLibrarySummary
): ActivityLibrarySourceCapabilityMetric[] {
  const capabilityCounts =
    summary?.sourceMaterialCapabilityCounts ??
    createEmptySourceMaterialCapabilityCounts();

  return [
    {
      capability: 'audio-extraction',
      label: m.activity_library_source_capability_audio(),
      value: formatActivityLibraryMetricNumber(
        capabilityCounts['audio-extraction']
      ),
    },
    {
      capability: 'worksheet-extraction',
      label: m.activity_library_source_capability_worksheet(),
      value: formatActivityLibraryMetricNumber(
        capabilityCounts['worksheet-extraction']
      ),
    },
    {
      capability: 'spreadsheet-import',
      label: m.activity_library_source_capability_spreadsheet(),
      value: formatActivityLibraryMetricNumber(
        capabilityCounts['spreadsheet-import']
      ),
    },
  ];
}

function formatActivityLibrarySourceExtractionDescription(
  summary: ActivityLibrarySummary
) {
  const extractableActivities = normalizeActivityLibraryMetricNumber(
    summary.extractableSourceActivities
  );

  if (extractableActivities === undefined) return undefined;
  if (extractableActivities === 0) {
    return m.activity_library_summary_source_extraction_empty();
  }
  if (extractableActivities === 1) {
    return m.activity_library_summary_source_extraction_one({
      count: extractableActivities,
    });
  }

  return m.activity_library_summary_source_extraction_many({
    count: extractableActivities,
  });
}

function formatActivityLibraryMetricNumber(value: number) {
  const normalizedValue = normalizeActivityLibraryMetricNumber(value);
  return normalizedValue === undefined ? '-' : String(normalizedValue);
}

function formatActivityLibraryMetricFraction(value: number, total: number) {
  const normalizedValue = normalizeActivityLibraryMetricNumber(value);
  const normalizedTotal = normalizeActivityLibraryMetricNumber(total);

  if (normalizedValue === undefined || normalizedTotal === undefined) {
    return '-';
  }

  return `${normalizedValue}/${normalizedTotal}`;
}

function normalizeActivityLibraryMetricNumber(value: number) {
  if (!Number.isFinite(value)) return undefined;
  return Math.floor(Math.max(0, value));
}

function createEmptySourceMaterialCapabilityCounts() {
  return {
    'audio-extraction': 0,
    'spreadsheet-import': 0,
    'worksheet-extraction': 0,
  } satisfies Record<ActivitySourceMaterialReadinessCapability, number>;
}
