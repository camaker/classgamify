import {
  archiveActivity,
  createActivity,
  duplicateActivity,
  getActivity,
  listActivities,
  remixActivityTemplate,
  restoreActivity,
  updateActivity,
} from '@/api/activities';
import { generateActivityDraft } from '@/api/activity-ai';
import type { ActivityTemplateType } from '@/activities/types';
import type { GenerateActivityDraftInput } from '@/activities/ai-draft';
import type { CreateActivityInput } from '@/activities/validation';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export const activitiesKeys = {
  all: ['activities'] as const,
  detail: (id: string) => [...activitiesKeys.details(), id] as const,
  details: () => [...activitiesKeys.all, 'details'] as const,
  list: (params: {
    pageIndex: number;
    pageSize: number;
    search?: string;
    status?: 'active' | 'archived';
    template?: ActivityTemplateType;
  }) => [...activitiesKeys.lists(), params] as const,
  lists: () => [...activitiesKeys.all, 'lists'] as const,
};

export function useActivities({
  pageIndex = 0,
  pageSize = 24,
  search,
  status = 'active',
  template,
}: {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: 'active' | 'archived';
  template?: ActivityTemplateType;
}) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () =>
      listActivities({
        data: {
          pageIndex,
          pageSize,
          search,
          status,
          template,
        },
      }),
    queryKey: activitiesKeys.list({
      pageIndex,
      pageSize,
      search,
      status,
      template,
    }),
  });
}

export function useActivity(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getActivity({ data: { id } }),
    queryKey: activitiesKeys.detail(id),
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateActivityInput) => createActivity({ data: input }),
    onSuccess: (activity) => {
      queryClient.invalidateQueries({ queryKey: activitiesKeys.lists() });
      queryClient.setQueryData(activitiesKeys.detail(activity.id), activity);
    },
  });
}

export function useGenerateActivityDraft() {
  return useMutation({
    mutationFn: (input: GenerateActivityDraftInput) =>
      generateActivityDraft({ data: input }),
  });
}

export function useDuplicateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { activityId: string }) =>
      duplicateActivity({ data: input }),
    onSuccess: (activity) => {
      queryClient.invalidateQueries({ queryKey: activitiesKeys.lists() });
      queryClient.setQueryData(activitiesKeys.detail(activity.id), activity);
    },
  });
}

export function useArchiveActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { activityId: string }) =>
      archiveActivity({ data: input }),
    onSuccess: (activity) => {
      queryClient.invalidateQueries({ queryKey: activitiesKeys.lists() });
      queryClient.setQueryData(activitiesKeys.detail(activity.id), activity);
    },
  });
}

export function useRestoreActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { activityId: string }) =>
      restoreActivity({ data: input }),
    onSuccess: (activity) => {
      queryClient.invalidateQueries({ queryKey: activitiesKeys.lists() });
      queryClient.setQueryData(activitiesKeys.detail(activity.id), activity);
    },
  });
}

export function useRemixActivityTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      activityId: string;
      targetTemplateType: ActivityTemplateType;
    }) => remixActivityTemplate({ data: input }),
    onSuccess: (activity) => {
      queryClient.invalidateQueries({ queryKey: activitiesKeys.lists() });
      queryClient.setQueryData(activitiesKeys.detail(activity.id), activity);
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateActivityInput & { id: string }) =>
      updateActivity({ data: input }),
    onSuccess: (activity) => {
      queryClient.invalidateQueries({ queryKey: activitiesKeys.lists() });
      queryClient.setQueryData(activitiesKeys.detail(activity.id), activity);
    },
  });
}
