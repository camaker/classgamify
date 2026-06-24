import type {
  ActivityLibraryStatus,
  ActivityTemplateFilter,
} from '@/activities/library-filters';
import { getTemplateByType } from '@/activities/catalog';
import {
  canDeriveActivityWork,
  isActivityArchived,
} from '@/activities/lifecycle';
import {
  buildActivityLibraryCardSummary,
  type ActivityLibraryCardSummary,
  type ActivityLibraryTemplateOption,
} from '@/activities/library-summary';
import {
  buildActivitySourceMaterialSummaryView,
  type ActivitySourceMaterialSummaryView,
} from '@/activities/material-summary';
import type {
  ActivityContent,
  ActivitySeed,
  ActivityTemplateType,
  ActivityVisibility,
} from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

type ActivityLibraryStatusOption = {
  label: string;
  value: ActivityLibraryStatus;
};

type ActivityLibraryEmptyStateView = {
  actionLabel: string;
  description: string;
  showStarterActivities: boolean;
  title: string;
};

type ActivityLibraryCardStatKey = 'groups' | 'pairs' | 'questions';

type ActivityLibraryCardStat = {
  key: ActivityLibraryCardStatKey;
  label: string;
  value: number;
};

type ActivityLibraryCompatibilityView = {
  lockedTemplateDiagnostics: string[];
  readyTemplateOptions: Array<
    ActivityLibraryTemplateOption & {
      isCurrent: boolean;
    }
  >;
  remixActionOptions: Array<
    ActivityLibraryTemplateOption & {
      actionLabel: string;
    }
  >;
  remixHint?: string;
};

type ActivityLibraryCardActionState = {
  canCreateDerivedWork: boolean;
  showArchiveAction: boolean;
  showDerivativeActions: boolean;
  showEditAction: boolean;
  showPersistedActions: boolean;
  showPublishAction: boolean;
  showRestoreAction: boolean;
  showRestoreRequiredMessage: boolean;
  showRemixActions: boolean;
};

type PersistedActivityLibraryCardSource = {
  contentJson: ActivityContent;
  description: string | null;
  id: string;
  templateType: ActivityTemplateType;
  title: string;
  visibility: ActivityVisibility;
};

type ActivityLibraryCardViewModel = {
  content: ActivityContent;
  description: string;
  id: string;
  persisted: boolean;
  status: ActivityVisibility;
  templateType: ActivityTemplateType;
  title: string;
};

type ActivityLibraryCardDisplayView = {
  actionState: ActivityLibraryCardActionState;
  compatibility: ActivityLibraryCompatibilityView;
  sourceMaterials: ActivitySourceMaterialSummaryView;
  stats: ActivityLibraryCardStat[];
  statusLabel: string;
  templateName: string;
  templateType: ActivityTemplateType;
};

type CreatedActivityListItem = {
  id: string;
  templateType: ActivityTemplateType;
  title: string;
  visibility: ActivityVisibility;
};

type CreatedActivityPanelContext = {
  activity?: CreatedActivityListItem;
  body: string;
  showCreateAction: boolean;
  showDismissAction: boolean;
  showEditAction: boolean;
  showMissingHint: boolean;
  showPublishAction: boolean;
  status: 'found' | 'loading' | 'missing';
  title: string;
};

export const activityLibraryPageCopy = {
  get breadcrumbCurrent() {
    return m.activity_library_breadcrumb_current();
  },
  get breadcrumbDashboard() {
    return m.activity_library_breadcrumb_dashboard();
  },
  get createActivityLabel() {
    return m.activity_library_page_create();
  },
  get description() {
    return m.activity_library_page_description();
  },
  get loadErrorMessage() {
    return m.activity_library_load_error();
  },
  get title() {
    return m.activity_library_page_title();
  },
} as const;

export const activityLibraryActionCopy = {
  get dismiss() {
    return m.activity_library_action_dismiss();
  },
} as const;

export const activityLibraryCreatedPanelCopy = {
  get missingHint() {
    return m.activity_library_created_panel_missing_hint();
  },
  get savedLabel() {
    return m.activity_library_created_panel_label();
  },
} as const;

export const activityLibraryHeroCopy = {
  get badgeLabel() {
    return m.activity_library_hero_badge();
  },
  get description() {
    return m.activity_library_hero_description();
  },
  get title() {
    return m.activity_library_hero_title();
  },
} as const;

export const activityLibrarySearchCopy = {
  get clearFiltersLabel() {
    return m.activity_library_filter_clear_filters();
  },
  get clearSearchLabel() {
    return m.activity_library_filter_clear_search();
  },
  get label() {
    return m.activity_library_filter_label();
  },
  get placeholder() {
    return m.activity_library_filter_placeholder();
  },
  get statusOptions() {
    return [
      { label: m.activity_library_filter_active(), value: 'active' },
      { label: m.activity_library_filter_archived(), value: 'archived' },
    ];
  },
  get templateLabel() {
    return m.activity_library_filter_template_label();
  },
  get templatePlaceholder() {
    return m.activity_library_filter_template_placeholder();
  },
} satisfies {
  clearFiltersLabel: string;
  clearSearchLabel: string;
  label: string;
  placeholder: string;
  statusOptions: ActivityLibraryStatusOption[];
  templateLabel: string;
  templatePlaceholder: string;
} as const;

export const activityLibraryCardCopy = {
  get actionLabels() {
    return {
      archive: m.activity_library_action_archive(),
      duplicate: m.activity_library_action_duplicate(),
      edit: m.activity_library_action_edit(),
      publish: m.activity_library_action_publish(),
      restore: m.activity_library_action_restore(),
    };
  },
  get compatibleTemplatesLabel() {
    return m.activity_library_card_compatible_templates();
  },
  get restoreRequiredMessage() {
    return m.activity_library_card_restore_required();
  },
} as const;

const activityLibraryEmptyStateCopy = {
  archived: {
    get actionLabel() {
      return activityLibrarySearchCopy.clearFiltersLabel;
    },
    get description() {
      return m.activity_library_empty_archived_description();
    },
    get title() {
      return m.activity_library_empty_archived_title();
    },
  },
  emptyLibrary: {
    get actionLabel() {
      return activityLibraryPageCopy.createActivityLabel;
    },
    get description() {
      return m.activity_library_empty_saved_description();
    },
    get title() {
      return m.activity_library_empty_saved_title();
    },
  },
  filtered: {
    get actionLabel() {
      return activityLibrarySearchCopy.clearFiltersLabel;
    },
    get description() {
      return m.activity_library_empty_filtered_description();
    },
    get title() {
      return m.activity_library_empty_filtered_title();
    },
  },
} as const;

export function buildActivityLibraryEmptyStateView({
  search,
  status,
  template,
}: {
  search?: string;
  status: ActivityLibraryStatus;
  template: ActivityTemplateFilter;
}): ActivityLibraryEmptyStateView {
  const hasContentFilters = Boolean(search) || template !== 'all';
  const hasFilters = hasContentFilters || status !== 'active';

  if (status === 'archived' && !hasContentFilters) {
    return {
      ...activityLibraryEmptyStateCopy.archived,
      showStarterActivities: false,
    };
  }

  if (hasFilters) {
    return {
      ...activityLibraryEmptyStateCopy.filtered,
      showStarterActivities: false,
    };
  }

  return {
    ...activityLibraryEmptyStateCopy.emptyLibrary,
    showStarterActivities: true,
  };
}

export function findCreatedActivityInList<
  TItem extends CreatedActivityListItem,
>({ activityId, items }: { activityId?: string; items: TItem[] }) {
  if (!activityId) return undefined;

  return items.find((item) => item.id === activityId);
}

export function resolveCreatedActivityPanelActivity<
  TItem extends CreatedActivityListItem,
>({
  activity,
  activityId,
  items,
}: {
  activity?: CreatedActivityListItem | null;
  activityId?: string;
  items: TItem[];
}) {
  if (!activityId) return undefined;
  if (activity?.id === activityId) return activity;

  return findCreatedActivityInList({ activityId, items });
}

export function buildCreatedActivityPanelContext({
  activity,
  isLoading,
}: {
  activity?: CreatedActivityListItem;
  isLoading: boolean;
}): CreatedActivityPanelContext {
  if (activity) {
    const canPublish = canDeriveActivityWork(activity.visibility);

    return {
      activity,
      body: m.activity_created_panel_found_body(),
      showCreateAction: true,
      showDismissAction: true,
      showEditAction: true,
      showMissingHint: false,
      showPublishAction: canPublish,
      status: 'found',
      title: activity.title,
    };
  }

  if (isLoading) {
    return {
      body: m.activity_created_panel_loading_body(),
      showCreateAction: true,
      showDismissAction: true,
      showEditAction: false,
      showMissingHint: false,
      showPublishAction: false,
      status: 'loading',
      title: m.activity_created_panel_loading_title(),
    };
  }

  return {
    body: m.activity_created_panel_missing_body(),
    showCreateAction: true,
    showDismissAction: true,
    showEditAction: false,
    showMissingHint: true,
    showPublishAction: false,
    status: 'missing',
    title: m.activity_created_panel_missing_title(),
  };
}

export function buildActivityLibraryCardStats({
  groups,
  pairs,
  questions,
}: {
  groups: number;
  pairs: number;
  questions: number;
}): ActivityLibraryCardStat[] {
  return [
    {
      key: 'questions',
      label: m.activity_library_stat_questions(),
      value: questions,
    },
    { key: 'pairs', label: m.activity_library_stat_pairs(), value: pairs },
    { key: 'groups', label: m.activity_library_stat_groups(), value: groups },
  ];
}

export function buildActivityLibraryCardViewModel(
  activity: PersistedActivityLibraryCardSource
): ActivityLibraryCardViewModel {
  return {
    content: activity.contentJson,
    description: activity.description ?? '',
    id: activity.id,
    persisted: true,
    status: activity.visibility,
    templateType: activity.templateType,
    title: activity.title,
  };
}

export function buildStarterActivityLibraryCardViewModel(
  activity: ActivitySeed
): ActivityLibraryCardViewModel {
  return {
    content: activity.content,
    description: activity.description,
    id: activity.id,
    persisted: false,
    status: activity.status,
    templateType: activity.templateType,
    title: activity.title,
  };
}

export function buildActivityLibraryCardDisplayView({
  activity,
  libraryStatus,
}: {
  activity: ActivityLibraryCardViewModel;
  libraryStatus: ActivityLibraryStatus;
}): ActivityLibraryCardDisplayView {
  const template = getTemplateByType(activity.templateType);
  const summary = buildActivityLibraryCardSummary({
    content: activity.content,
    templateType: template.type,
  });

  return {
    actionState: buildActivityLibraryCardActionState({
      libraryStatus,
      persisted: activity.persisted,
      readyRemixCount: summary.suggestedTemplateOptions.length,
      visibility: activity.status,
    }),
    compatibility: buildActivityLibraryCompatibilityView({
      currentTemplateType: activity.templateType,
      summary,
    }),
    sourceMaterials: buildActivitySourceMaterialSummaryView(
      activity.content.sourceMaterials
    ),
    stats: buildActivityLibraryCardStats({
      groups: summary.contentCounts.groups,
      pairs: summary.contentCounts.pairs,
      questions: summary.contentCounts.questions,
    }),
    statusLabel: formatActivityLibraryCardStatusLabel(activity),
    templateName: template.name,
    templateType: template.type,
  };
}

function formatActivityLibraryCardStatusLabel({
  persisted,
  status,
}: Pick<ActivityLibraryCardViewModel, 'persisted' | 'status'>) {
  if (!persisted) {
    return m.activity_library_status_preview();
  }

  return formatActivityLibraryStatusLabel(status);
}

export function formatActivityLibraryStatusLabel(
  visibility: ActivityVisibility
) {
  switch (visibility) {
    case 'archived':
      return m.activity_library_status_archived();
    case 'draft':
      return m.activity_form_visibility_draft();
    case 'private':
      return m.activity_form_visibility_private();
    case 'public':
      return m.activity_form_visibility_public();
    case 'unlisted':
      return m.activity_form_visibility_unlisted();
  }
}

export function buildActivityLibraryRemixHint(shortNames: string[]) {
  const templateList = shortNames
    .map((shortName) => shortName.trim())
    .filter(Boolean)
    .join(', ');

  return templateList
    ? m.activity_library_remix_hint({ templates: templateList })
    : undefined;
}

export function buildActivityLibraryRemixActionLabel(shortName: string) {
  const templateName = shortName.trim();

  return m.activity_library_remix_action({
    template: templateName || m.activity_library_remix_action_fallback(),
  });
}

export function buildActivityLibraryCompatibilityView({
  currentTemplateType,
  summary,
}: {
  currentTemplateType: ActivityTemplateType;
  summary: ActivityLibraryCardSummary;
}): ActivityLibraryCompatibilityView {
  return {
    lockedTemplateDiagnostics: summary.lockedTemplateDiagnostics.slice(0, 2),
    readyTemplateOptions: summary.readyTemplateOptions.map((option) => ({
      ...option,
      isCurrent: option.template === currentTemplateType,
    })),
    remixActionOptions: summary.suggestedTemplateOptions
      .slice(0, 3)
      .map((option) => ({
        ...option,
        actionLabel: buildActivityLibraryRemixActionLabel(option.shortName),
      })),
    remixHint: buildActivityLibraryRemixHint(
      summary.suggestedTemplateOptions.map((option) => option.shortName)
    ),
  };
}

export function buildActivityLibraryCardActionState({
  libraryStatus,
  persisted,
  readyRemixCount,
  visibility,
}: {
  libraryStatus: ActivityLibraryStatus;
  persisted: boolean;
  readyRemixCount: number;
  visibility: ActivityVisibility;
}): ActivityLibraryCardActionState {
  const showActiveActions = libraryStatus === 'active';
  const canCreateDerivedWork = canDeriveActivityWork(visibility);
  const archived = isActivityArchived(visibility);
  const showDerivativeActions =
    persisted && showActiveActions && canCreateDerivedWork;

  return {
    canCreateDerivedWork,
    showArchiveAction: persisted && showActiveActions && !archived,
    showDerivativeActions,
    showEditAction: persisted && showActiveActions && !archived,
    showPersistedActions: persisted,
    showPublishAction: persisted && showActiveActions && canCreateDerivedWork,
    showRestoreAction: persisted && archived,
    showRestoreRequiredMessage: persisted && archived,
    showRemixActions: showDerivativeActions && readyRemixCount > 0,
  };
}
