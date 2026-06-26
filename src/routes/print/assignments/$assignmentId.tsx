import {
  buildPrintableAssignmentSearch,
  parsePrintableAssignmentSearch,
} from '@/assignments/printable-worksheet';
import {
  buildPrintableWorksheetPageViewModel,
  buildPrintableWorksheetErrorView,
  buildPrintableWorksheetLoadingView,
} from '@/assignments/printable-worksheet-view';
import { PrintableWorksheetAnswerKey } from '@/components/assignments/printable-worksheet-answer-key';
import { PrintableWorksheetAssignmentFields } from '@/components/assignments/printable-worksheet-assignment-fields';
import { PrintableWorksheetHeader } from '@/components/assignments/printable-worksheet-header';
import { PrintableWorksheetItemList } from '@/components/assignments/printable-worksheet-item-list';
import { PrintableWorksheetStatePanel } from '@/components/assignments/printable-worksheet-state-panel';
import { PrintableWorksheetToolbar } from '@/components/assignments/printable-worksheet-toolbar';
import { usePrintableAssignmentWorksheet } from '@/hooks/use-assignments';
import { m } from '@/locale/paraglide/messages';
import { authRouteMiddleware } from '@/middlewares/auth-middleware';
import { seo } from '@/lib/seo';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/print/assignments/$assignmentId')({
  validateSearch: parsePrintableAssignmentSearch,
  head: () =>
    seo('/print/assignments', {
      title: m.assignment_printable_seo_title(),
      description: m.assignment_printable_seo_description(),
      robots: 'noindex, nofollow',
    }),
  ssr: false,
  server: {
    middleware: [authRouteMiddleware],
  },
  component: PrintableAssignmentWorksheetPage,
});

function PrintableAssignmentWorksheetPage() {
  const { assignmentId } = Route.useParams();
  const { answerKey = false } = Route.useSearch();
  const navigate = useNavigate({
    from: '/print/assignments/$assignmentId',
  });
  const { data, isError, isLoading } = usePrintableAssignmentWorksheet({
    assignmentId,
    includeAnswerKey: answerKey,
  });

  useEffect(() => {
    document.body.dataset.printMode = 'worksheet';

    return () => {
      if (document.body.dataset.printMode === 'worksheet') {
        delete document.body.dataset.printMode;
      }
    };
  }, []);

  function updateAnswerKey(nextAnswerKey: boolean) {
    void navigate({
      replace: true,
      search: buildPrintableAssignmentSearch({ answerKey: nextAnswerKey }),
    });
  }

  if (isLoading) {
    return (
      <PrintableWorksheetStatePanel
        mode="loading"
        view={buildPrintableWorksheetLoadingView()}
      />
    );
  }

  if (isError || !data) {
    return (
      <PrintableWorksheetStatePanel
        mode="error"
        view={buildPrintableWorksheetErrorView()}
      />
    );
  }

  const pageView = buildPrintableWorksheetPageViewModel({
    answerKey,
    worksheet: data,
  });
  const { controlView, headerView } = pageView;

  return (
    <main
      data-print-page="assignment-worksheet"
      className="min-h-svh bg-muted/30 px-4 py-4 text-foreground sm:px-6 lg:px-8"
    >
      <div
        data-print-shell
        className="mx-auto grid max-w-5xl gap-4 rounded-lg border bg-background p-4 shadow-sm sm:p-6 print:shadow-none"
      >
        <PrintableWorksheetToolbar
          assignmentId={assignmentId}
          controlView={controlView}
          onAnswerKeyChange={updateAnswerKey}
          onPrint={() => window.print()}
        />

        <article data-print-root className="grid gap-6">
          <PrintableWorksheetHeader headerView={headerView} />

          <PrintableWorksheetAssignmentFields
            fieldViews={pageView.assignmentFieldViews}
          />

          <PrintableWorksheetItemList
            emptyState={pageView.emptyState}
            itemViews={pageView.itemViews}
          />

          <PrintableWorksheetAnswerKey view={pageView.answerKeyView} />
        </article>
      </div>
    </main>
  );
}
