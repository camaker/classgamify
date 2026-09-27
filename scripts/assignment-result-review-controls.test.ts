import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAssignmentResultControlSearchState,
  buildAssignmentResultRouteSearch,
  resolveAssignmentResultViewState,
} from '@/assignments/result-view';
import {
  DEFAULT_ATTEMPT_REVIEW_FILTER,
  DEFAULT_ITEM_PERFORMANCE_SORT,
  DEFAULT_STUDENT_SUMMARY_SORT,
} from '@/assignments/result-filters';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const SECRET_STUDENT_LABEL = 'Alice Private';

test('assignment result review controls helpers keep default and invalid route state out', () => {
  overwriteGetLocale(() => 'en');

  const parsedSearch = buildAssignmentResultRouteSearch({
    itemSort: 'original',
    review: 'all',
    sort: 'needs-review',
    student: '  Ａｌｉｃｅ 　 Ｐｒｉｖａｔｅ  ',
  });

  assert.deepEqual(parsedSearch, {
    itemSort: undefined,
    review: undefined,
    sort: undefined,
    student: SECRET_STUDENT_LABEL,
  });
  assert.deepEqual(resolveAssignmentResultViewState(parsedSearch), {
    attemptReviewFilter: 'all',
    itemPerformanceSort: 'original',
    studentSearch: SECRET_STUDENT_LABEL,
    studentSort: 'needs-review',
  });
  assert.deepEqual(
    buildAssignmentResultControlSearchState({
      current: {
        itemSort: 'accuracy',
        review: 'needs-review',
        sort: 'best',
        student: SECRET_STUDENT_LABEL,
      },
      update: {
        control: 'student-search',
        value: '',
      },
    }),
    {
      itemSort: 'accuracy',
      review: 'needs-review',
      sort: 'best',
      student: undefined,
    }
  );
  assert.deepEqual(
    buildAssignmentResultRouteSearch({
      itemSort: 'unknown',
      review: 'wrong',
      sort: ['best'],
      student: ['student'],
    }),
    {
      itemSort: undefined,
      review: undefined,
      sort: undefined,
      student: undefined,
    }
  );

  assert.deepEqual(
    resolveAssignmentResultViewState(buildAssignmentResultRouteSearch({})),
    {
      attemptReviewFilter: DEFAULT_ATTEMPT_REVIEW_FILTER,
      itemPerformanceSort: DEFAULT_ITEM_PERFORMANCE_SORT,
      studentSearch: '',
      studentSort: DEFAULT_STUDENT_SUMMARY_SORT,
    }
  );
});
