import {
  getPublicAssignment,
  listAssignments,
  publishAssignment,
} from '@/api/assignments';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export const assignmentsKeys = {
  all: ['assignments'] as const,
  list: (params: { pageIndex: number; pageSize: number }) =>
    [...assignmentsKeys.lists(), params] as const,
  lists: () => [...assignmentsKeys.all, 'lists'] as const,
  public: (shareSlug: string) =>
    [...assignmentsKeys.publics(), shareSlug] as const,
  publics: () => [...assignmentsKeys.all, 'public'] as const,
};

export function useAssignments({
  pageIndex = 0,
  pageSize = 24,
}: {
  pageIndex?: number;
  pageSize?: number;
}) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => listAssignments({ data: { pageIndex, pageSize } }),
    queryKey: assignmentsKeys.list({ pageIndex, pageSize }),
  });
}

export function usePublishAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) =>
      publishAssignment({ data: { activityId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.lists() });
    },
  });
}

export function usePublicAssignment(shareSlug: string) {
  return useQuery({
    enabled: Boolean(shareSlug),
    queryFn: () => getPublicAssignment({ data: { shareSlug } }),
    queryKey: assignmentsKeys.public(shareSlug),
  });
}
