import {
  parsePrintableAssignmentSearch,
  type PrintableAssignmentSearch,
} from '@/assignments/printable-worksheet';
import {
  buildPrintableWorksheetHeaderView,
  buildPrintableWorksheetAnswerKeyItemView,
  buildPrintableWorksheetItemView,
  printableWorksheetPageCopy,
} from '@/assignments/printable-worksheet-view';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { usePrintableAssignmentWorksheet } from '@/hooks/use-assignments';
import { m } from '@/locale/paraglide/messages';
import { authRouteMiddleware } from '@/middlewares/auth-middleware';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconKey,
  IconPrinter,
  IconSchool,
} from '@tabler/icons-react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
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
      search: { answerKey: nextAnswerKey ? true : undefined },
    });
  }

  if (isLoading) {
    return (
      <main
        data-print-page="assignment-worksheet"
        className="flex min-h-svh items-center justify-center bg-muted/20 p-6"
      >
        <Spinner className="size-6" />
        <span className="sr-only">
          {printableWorksheetPageCopy.loadingLabel}
        </span>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main
        data-print-page="assignment-worksheet"
        className="mx-auto grid min-h-svh max-w-3xl place-items-center p-6"
      >
        <Card className="w-full rounded-lg">
          <CardContent className="p-6 text-sm text-destructive">
            {printableWorksheetPageCopy.loadErrorMessage}
          </CardContent>
        </Card>
      </main>
    );
  }

  const headerView = buildPrintableWorksheetHeaderView(data);
  const answerKeyItems = data.answerKey ?? [];

  return (
    <main
      data-print-page="assignment-worksheet"
      className="min-h-svh bg-muted/30 px-4 py-4 text-foreground sm:px-6 lg:px-8"
    >
      <div
        data-print-shell
        className="mx-auto grid max-w-5xl gap-4 rounded-lg border bg-background p-4 shadow-sm sm:p-6 print:shadow-none"
      >
        <div
          data-print-hidden
          className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <Link
            to="/dashboard/assignments/$assignmentId"
            params={{ assignmentId }}
            className={cn(buttonVariants({ variant: 'outline' }), 'w-fit')}
          >
            <IconArrowLeft className="size-4" />
            {printableWorksheetPageCopy.backToResultsLabel}
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label
              htmlFor="printable-answer-key"
              className="flex items-center gap-2 text-sm"
            >
              <Switch
                id="printable-answer-key"
                checked={answerKey}
                onCheckedChange={updateAnswerKey}
              />
              <span>{printableWorksheetPageCopy.answerKeyLabel}</span>
            </label>
            <Button type="button" onClick={() => window.print()}>
              <IconPrinter className="size-4" />
              {printableWorksheetPageCopy.printButtonLabel}
            </Button>
          </div>
        </div>

        <article data-print-root className="grid gap-6">
          <header
            data-print-header
            className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-md">
                  {printableWorksheetPageCopy.printModeLabel}
                </Badge>
                <Badge variant="outline" className="rounded-md">
                  {headerView.templateLabel}
                </Badge>
              </div>
              <h1 className="mt-3 text-2xl font-semibold leading-tight">
                {headerView.assignmentTitle}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {headerView.activityTitle}
              </p>
              {headerView.activityDescription ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {headerView.activityDescription}
                </p>
              ) : null}
            </div>
            <div
              data-print-brand
              className="rounded-lg border bg-muted/30 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2 font-medium">
                <IconSchool className="size-4" />
                {printableWorksheetPageCopy.brandLabel}
              </div>
              <p className="mt-1 text-muted-foreground">
                {headerView.sharePath}
              </p>
            </div>
          </header>

          <section
            data-print-assignment
            className="grid gap-3 rounded-lg border bg-muted/20 p-4 text-sm sm:grid-cols-2"
          >
            <div>
              <p className="font-medium">
                {printableWorksheetPageCopy.studentNameLabel}
              </p>
              <div className="mt-3 h-8 border-b" />
            </div>
            <div>
              <p className="font-medium">
                {printableWorksheetPageCopy.sharePathLabel}
              </p>
              <p className="mt-2 text-muted-foreground">
                {headerView.sharePath}
              </p>
            </div>
            <div>
              <p className="font-medium">
                {printableWorksheetPageCopy.instructionsLabel}
              </p>
              <p className="mt-2 text-muted-foreground">
                {headerView.instructions}
              </p>
            </div>
            <div>
              <p className="font-medium">
                {printableWorksheetPageCopy.deliveryPolicyLabel}
              </p>
              <p className="mt-2 text-muted-foreground">
                {headerView.deliveryPolicy}
              </p>
            </div>
          </section>

          {data.items.length > 0 ? (
            <section data-print-items className="grid gap-4">
              {data.items.map((item) => (
                <PrintableWorksheetItem key={item.id} item={item} />
              ))}
            </section>
          ) : (
            <section className="rounded-lg border border-dashed p-6">
              <h2 className="font-semibold">
                {printableWorksheetPageCopy.emptyTitle}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {printableWorksheetPageCopy.emptyDescription}
              </p>
            </section>
          )}

          {answerKey && answerKeyItems.length > 0 ? (
            <section data-print-answer-key className="grid gap-3 border-t pt-5">
              <div className="flex items-center gap-2">
                <IconKey className="size-5 text-primary" />
                <div>
                  <h2 className="font-semibold">
                    {printableWorksheetPageCopy.answerKeyTitle}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {printableWorksheetPageCopy.answerKeyDescription}
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                {answerKeyItems.map((item) => {
                  const itemView =
                    buildPrintableWorksheetAnswerKeyItemView(item);

                  return (
                    <div
                      key={itemView.id}
                      className="rounded-lg border bg-muted/20 p-3 text-sm"
                    >
                      <p className="font-medium">{itemView.answerLabel}</p>
                      <p className="mt-1 text-muted-foreground">
                        {itemView.prompt}
                      </p>
                      {itemView.acceptedAnswersLabel ? (
                        <p className="mt-1 text-muted-foreground">
                          {itemView.acceptedAnswersLabel}
                        </p>
                      ) : null}
                      {itemView.explanationLabel ? (
                        <p className="mt-1 text-muted-foreground">
                          {itemView.explanationLabel}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </article>
      </div>
    </main>
  );
}

function PrintableWorksheetItem({
  item,
}: {
  item: NonNullable<
    ReturnType<typeof usePrintableAssignmentWorksheet>['data']
  >['items'][number];
}) {
  const itemView = buildPrintableWorksheetItemView(item);

  return (
    <section
      data-print-item
      className="break-inside-avoid rounded-lg border bg-background p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">
            {itemView.sequenceLabel} · {itemView.kindLabel}
          </p>
          <h2 className="mt-2 font-semibold leading-6">{itemView.prompt}</h2>
        </div>
        <Badge variant="outline" className="rounded-md">
          {itemView.responseHelp}
        </Badge>
      </div>
      {itemView.choiceBank.choices.length > 0 ? (
        <div
          data-print-choice-bank={itemView.choiceBank.presentation}
          className={cn(
            'mt-4 grid gap-2',
            itemView.choiceBank.presentation === 'group-bank'
              ? 'sm:grid-cols-3'
              : 'sm:grid-cols-2'
          )}
        >
          {itemView.choiceBank.choices.map(({ choice, indexLabel, key }) => (
            <div
              key={key}
              className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                itemView.choiceBank.presentation === 'group-bank'
                  ? 'justify-center bg-background font-medium'
                  : 'bg-muted/20'
              )}
            >
              {itemView.choiceBank.showIndexLabels ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border bg-background text-xs">
                  {indexLabel}
                </span>
              ) : null}
              <span>{choice}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-4 grid gap-3">
        {itemView.answerLines.map((line) => (
          <div key={line.key} className="h-8 border-b" />
        ))}
      </div>
    </section>
  );
}
