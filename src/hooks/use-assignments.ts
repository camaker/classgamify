import {
  getAssignmentResults,
  getPublicAssignment,
  listAssignments,
  publishAssignment,
  submitAttempt,
  updateAssignmentStatus,
} from '@/api/assignments';
import type {
  PublishAssignmentInput,
  UpdateAssignmentStatusInput,
} from '@/assignments/validation';
import type { StudentAttemptSubmissionInput } from '@/assignments/student-submission';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

const assignmentsKeys = {
  all: ['assignments'] as const,
  detail: (assignmentId: string) =>
    [...assignmentsKeys.details(), assignmentId] as const,
  details: () => [...assignmentsKeys.all, 'details'] as const,
  list: (params: {
    pageIndex: number;
    pageSize: number;
    publishedShareSlug?: string;
    search?: string;
    status?: 'draft' | 'published' | 'closed';
  }) => [...assignmentsKeys.lists(), params] as const,
  lists: () => [...assignmentsKeys.all, 'lists'] as const,
  public: (shareSlug: string) =>
    [...assignmentsKeys.publics(), shareSlug] as const,
  publics: () => [...assignmentsKeys.all, 'public'] as const,
};

export function useAssignments({
  pageIndex = 0,
  pageSize = 24,
  publishedShareSlug,
  search,
  status,
}: {
  pageIndex?: number;
  pageSize?: number;
  publishedShareSlug?: string;
  search?: string;
  status?: 'draft' | 'published' | 'closed';
}) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () =>
      listAssignments({
        data: { pageIndex, pageSize, publishedShareSlug, search, status },
      }),
    queryKey: assignmentsKeys.list({
      pageIndex,
      pageSize,
      publishedShareSlug,
      search,
      status,
    }),
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
    mutationFn: (input: PublishAssignmentInput) =>
      publishAssignment({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.details() });
    },
  });
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAssignmentStatusInput) =>
      updateAssignmentStatus({ data: input }),
    onSuccess: (row, input) => {
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: assignmentsKeys.detail(input.assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: assignmentsKeys.public(row.assignment.shareSlug),
      });
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
    mutationFn: (input: StudentAttemptSubmissionInput) =>
      submitAttempt({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.details() });
    },
  });
}
