import type {
  StudentRunnerMissingPageView,
  StudentRunnerUnavailableSafetyItemView,
} from '@/assignments/student-runner-state';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconCircleOff,
  IconDeviceGamepad2,
  IconEyeOff,
  IconRoute,
  IconSendOff,
  IconUserOff,
  type Icon,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type StudentRunnerMissingPanelProps = {
  view: StudentRunnerMissingPageView;
};

export function StudentRunnerMissingPanel({
  view,
}: StudentRunnerMissingPanelProps) {
  const titleId = 'student-runner-missing-title';
  const descriptionId = 'student-runner-missing-description';
  const safetyTitleId = 'student-runner-unavailable-safety-title';
  const safetyDescriptionId = 'student-runner-unavailable-safety-description';

  return (
    <Container className="px-4 py-10 md:py-14">
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className="mx-auto max-w-3xl rounded-lg border bg-card p-6"
      >
        <Badge variant="outline" className="rounded-md border-primary/30">
          <IconDeviceGamepad2 className="size-3.5" />
          {view.badgeLabel}
        </Badge>
        <h1 id={titleId} className="mt-4 text-3xl font-bold tracking-tight">
          {view.title}
        </h1>
        <p
          id={descriptionId}
          className="mt-3 text-sm leading-6 text-muted-foreground"
        >
          {view.description}
        </p>
        <dl
          aria-labelledby={titleId}
          className="mt-5 grid gap-2 sm:grid-cols-2"
        >
          {view.scopeItems.map((item) => (
            <StudentRunnerMissingScopeItem item={item} key={item.id} />
          ))}
        </dl>
        {view.unavailableSafetyView ? (
          <section
            aria-describedby={safetyDescriptionId}
            aria-labelledby={safetyTitleId}
            className="mt-5 border-t pt-5"
          >
            <div>
              <h2 className="font-semibold text-base" id={safetyTitleId}>
                {view.unavailableSafetyView.title}
              </h2>
              <p
                id={safetyDescriptionId}
                className="mt-2 text-muted-foreground text-sm leading-6"
              >
                {view.unavailableSafetyView.description}
              </p>
            </div>
            <dl
              aria-describedby={safetyDescriptionId}
              aria-labelledby={safetyTitleId}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              {view.unavailableSafetyView.items.map((item) => (
                <StudentRunnerUnavailableSafetyItem item={item} key={item.id} />
              ))}
            </dl>
          </section>
        ) : null}
        <Link
          to={Routes.Templates}
          className={cn(buttonVariants(), 'mt-5 w-fit')}
        >
          {view.browseTemplatesLabel}
        </Link>
      </section>
    </Container>
  );
}

function StudentRunnerMissingScopeItem({
  item,
}: {
  item: StudentRunnerMissingPageView['scopeItems'][number];
}) {
  const labelId = `student-runner-missing-scope-${item.id}-label`;
  const valueId = `student-runner-missing-scope-${item.id}-value`;
  const descriptionId = `student-runner-missing-scope-${item.id}-description`;

  return (
    <div
      className="flex min-w-0 gap-3 rounded-lg border bg-background p-3"
      data-missing-scope-item={item.id}
    >
      <StudentRunnerMissingScopeIcon id={item.id} />
      <div className="min-w-0">
        <dt id={labelId} className="text-muted-foreground text-xs">
          {item.label}
        </dt>
        <dd>
          <output
            aria-describedby={descriptionId}
            aria-label={item.ariaLabel}
            aria-labelledby={`${labelId} ${valueId}`}
            className="font-medium text-sm"
            id={valueId}
          >
            {item.value}
          </output>
          <p
            id={descriptionId}
            className="mt-1 text-muted-foreground text-xs leading-5"
          >
            {item.description}
          </p>
        </dd>
      </div>
    </div>
  );
}

function StudentRunnerUnavailableSafetyItem({
  item,
}: {
  item: StudentRunnerUnavailableSafetyItemView;
}) {
  const labelId = `student-runner-unavailable-safety-${item.id}-label`;
  const valueId = `student-runner-unavailable-safety-${item.id}-value`;
  const descriptionId = `student-runner-unavailable-safety-${item.id}-description`;

  return (
    <div
      className="flex min-w-0 gap-3 border-l pl-3"
      data-unavailable-safety-item={item.id}
    >
      <StudentRunnerUnavailableSafetyIcon id={item.id} />
      <div className="min-w-0">
        <dt id={labelId} className="text-muted-foreground text-xs">
          {item.label}
        </dt>
        <dd>
          <output
            aria-describedby={descriptionId}
            aria-label={item.ariaLabel}
            aria-labelledby={`${labelId} ${valueId}`}
            className="font-medium text-sm"
            id={valueId}
          >
            {item.value}
          </output>
          <p
            id={descriptionId}
            className="mt-1 text-muted-foreground text-xs leading-5"
          >
            {item.description}
          </p>
        </dd>
      </div>
    </div>
  );
}

function StudentRunnerMissingScopeIcon({
  id,
}: {
  id: StudentRunnerMissingPageView['scopeItems'][number]['id'];
}) {
  const Icon = studentRunnerMissingScopeIcons[id];
  return <Icon className="mt-0.5 size-4 shrink-0 text-primary" />;
}

function StudentRunnerUnavailableSafetyIcon({
  id,
}: {
  id: StudentRunnerUnavailableSafetyItemView['id'];
}) {
  const Icon = studentRunnerUnavailableSafetyIcons[id];
  return <Icon className="mt-0.5 size-4 shrink-0 text-primary" />;
}

const studentRunnerMissingScopeIcons = {
  'activity-content': IconEyeOff,
  'browser-identity': IconUserOff,
  'link-status': IconCircleOff,
  'next-step': IconRoute,
  submissions: IconSendOff,
} satisfies Record<
  StudentRunnerMissingPageView['scopeItems'][number]['id'],
  Icon
>;

const studentRunnerUnavailableSafetyIcons = {
  'activity-content': IconEyeOff,
  'answer-feedback': IconCircleOff,
  'browser-identity': IconUserOff,
  'source-materials': IconRoute,
  submissions: IconSendOff,
} satisfies Record<StudentRunnerUnavailableSafetyItemView['id'], Icon>;
