import {
  getAssignmentResults,
  getPublicAssignment,
  listAssignments,
  publishAssignment,
  submitAttempt,
} from '@/api/assignments';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export const assignmentsKeys = {
  all: ['assignments'] as const,
  detail: (assignmentId: string) =>
    [...assignmentsKeys.details(), assignmentId] as const,
  details: () => [...assignmentsKeys.all, 'details'] as const,
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

export function useAssignmentResults(assignmentId: string) {
  return useQuery({
    enabled: Boolean(assignmentId),
    queryFn: () => getAssignmentResults({ data: { assignmentId } }),
    queryKey: assignmentsKeys.detail(assignmentId),
  });
}

export function usePublishAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) =>
      publishAssignment({ data: { activityId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.details() });
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

export function useSubmitAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      answers: Array<{ answer: string; itemId: string }>;
      durationSeconds?: number;
      shareSlug: string;
      studentName?: string;
    }) => submitAttempt({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.details() });
    },
  });
}
