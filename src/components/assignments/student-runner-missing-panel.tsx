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
  return (
    <Container className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-3xl rounded-lg border bg-card p-6">
        <Badge variant="outline" className="rounded-md border-primary/30">
          <IconDeviceGamepad2 className="size-3.5" />
          {view.badgeLabel}
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{view.title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {view.description}
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {view.scopeItems.map((item) => (
            <div
              className="flex min-w-0 gap-3 rounded-lg border bg-background p-3"
              key={item.id}
            >
              <StudentRunnerMissingScopeIcon id={item.id} />
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">{item.label}</p>
                <p className="font-medium text-sm">{item.value}</p>
                <p className="mt-1 text-muted-foreground text-xs leading-5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        {view.unavailableSafetyView ? (
          <section
            aria-labelledby="student-runner-unavailable-safety-title"
            className="mt-5 border-t pt-5"
          >
            <div>
              <h2
                className="font-semibold text-base"
                id="student-runner-unavailable-safety-title"
              >
                {view.unavailableSafetyView.title}
              </h2>
              <p className="mt-2 text-muted-foreground text-sm leading-6">
                {view.unavailableSafetyView.description}
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {view.unavailableSafetyView.items.map((item) => (
                <div className="flex min-w-0 gap-3 border-l pl-3" key={item.id}>
                  <StudentRunnerUnavailableSafetyIcon id={item.id} />
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-xs">
                      {item.label}
                    </p>
                    <p className="font-medium text-sm">{item.value}</p>
                    <p className="mt-1 text-muted-foreground text-xs leading-5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        <Link
          to={Routes.Templates}
          className={cn(buttonVariants(), 'mt-5 w-fit')}
        >
          {view.browseTemplatesLabel}
        </Link>
      </div>
    </Container>
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
