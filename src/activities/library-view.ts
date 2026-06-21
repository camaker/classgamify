import type {
  ActivityLibraryStatus,
  ActivityTemplateFilter,
} from '@/activities/library-filters';

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

export const activityLibraryPageCopy = {
  breadcrumbCurrent: 'Activities',
  breadcrumbDashboard: 'Dashboard',
  createActivityLabel: 'Create activity',
  description:
    'Reusable teacher-owned activities. Each activity stores template-neutral content so it can render as different classroom games.',
  loadErrorMessage:
    'Activities could not be loaded. Refresh the page or sign in again.',
  title: 'Activity library',
} as const;

export const activityLibraryHeroCopy = {
  badgeLabel: 'Structured activity content',
  description:
    'The activity model separates questions, pairs, groups, vocabulary, and teacher notes. Template switching and AI creation can both build on this shared contract.',
  title: 'One lesson, several renderings.',
} as const;

export const activityLibrarySearchCopy = {
  clearFiltersLabel: 'Clear filters',
  clearSearchLabel: 'Clear activity search',
  label: 'Search activities',
  placeholder: 'Search by title, description, or template',
  statusOptions: [
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' },
  ],
  templateLabel: 'Template',
  templatePlaceholder: 'All templates',
} satisfies {
  clearFiltersLabel: string;
  clearSearchLabel: string;
  label: string;
  placeholder: string;
  statusOptions: ActivityLibraryStatusOption[];
  templateLabel: string;
  templatePlaceholder: string;
};

export const activityLibraryCardCopy = {
  actionLabels: {
    archive: 'Archive',
    duplicate: 'Duplicate',
    edit: 'Edit activity',
    publish: 'Publish assignment',
    restore: 'Restore',
  },
  compatibleTemplatesLabel: 'Compatible template families',
  restoreRequiredMessage:
    'Restore this activity before publishing, duplicating, or remixing it.',
} as const;

const activityLibraryEmptyStateCopy = {
  archived: {
    actionLabel: activityLibrarySearchCopy.clearFiltersLabel,
    description:
      'Archived activities will appear here after you move them out of the active library.',
    title: 'No archived activities.',
  },
  emptyLibrary: {
    actionLabel: activityLibraryPageCopy.createActivityLabel,
    description:
      'Create the first reusable classroom activity, then publish it as a student assignment link for your class.',
    title: 'No saved activities yet.',
  },
  filtered: {
    actionLabel: activityLibrarySearchCopy.clearFiltersLabel,
    description:
      'Try another title, description, template keyword, or template family from your classroom activity library.',
    title: 'No matching activities.',
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
    { key: 'questions', label: 'Questions', value: questions },
    { key: 'pairs', label: 'Pairs', value: pairs },
    { key: 'groups', label: 'Groups', value: groups },
  ];
}

export function buildActivityLibraryRemixHint(shortNames: string[]) {
  const templateList = shortNames
    .map((shortName) => shortName.trim())
    .filter(Boolean)
    .join(', ');

  return templateList ? `Ready to remix into ${templateList}.` : undefined;
}

export function buildActivityLibraryRemixActionLabel(shortName: string) {
  const templateName = shortName.trim();

  return `Copy as ${templateName || 'template'}`;
}
