import { BottomLink } from '@/components/auth/bottom-link';
import { Logo } from '@/components/shared/logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import {
  IconCircleCheck,
  IconKey,
  IconInfoCircle,
  IconListCheck,
  IconRoute,
  IconShieldCheck,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';
import type {
  AuthWorkspaceBoundaryItemId,
  AuthWorkspaceBoundaryView,
} from '@/auth/workspace-boundary';
import { cn } from '@/lib/utils';

export type AuthCardBenefitItem = {
  id: string;
  text: string;
};

export type AuthWorkflowStep = {
  id: string;
  label: string;
  title: string;
  description: string;
};

interface AuthCardProps {
  children: React.ReactNode;
  eyebrow?: string;
  headerLabel: string;
  description?: string;
  benefits?: AuthCardBenefitItem[];
  workflowSteps?: AuthWorkflowStep[];
  workspaceBoundary?: AuthWorkspaceBoundaryView;
  returnHint?: string;
  trustNote?: string;
  bottomButtonLabel: string;
  bottomButtonHref: string;
  bottomButtonSearch?: Record<string, string>;
  className?: string;
}

export function AuthCard({
  children,
  eyebrow,
  headerLabel,
  description,
  benefits,
  workflowSteps,
  workspaceBoundary,
  returnHint,
  trustNote,
  bottomButtonLabel,
  bottomButtonHref,
  bottomButtonSearch,
  className,
}: AuthCardProps) {
  const hasBenefits = benefits && benefits.length > 0;
  const hasWorkflowSteps = workflowSteps && workflowSteps.length > 0;

  return (
    <Card
      className={cn('shadow-xs border border-border pt-5', className)}
      size="default"
    >
      <CardHeader className="flex flex-col items-center px-4 sm:px-5">
        <Link to="/">
          <Logo className="mb-2" />
        </Link>
        {eyebrow && (
          <p className="text-center text-xs font-medium uppercase text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <CardDescription className="text-center text-base font-medium text-foreground">
          {headerLabel}
        </CardDescription>
        {description && (
          <p className="max-w-[34rem] text-center text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {returnHint && (
          <div className="mt-2 flex w-full items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-xs leading-relaxed text-primary">
            <IconRoute
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
              stroke={1.8}
            />
            <span className="min-w-0">{returnHint}</span>
          </div>
        )}
        {hasBenefits && (
          <div className="mt-3 w-full rounded-lg border border-border/70 bg-muted/35 px-3 py-2.5 text-left">
            <ul className="space-y-2">
              {benefits.map((benefit) => (
                <li
                  key={benefit.id}
                  className="grid grid-cols-[1rem_1fr] gap-2 text-xs leading-relaxed text-muted-foreground"
                >
                  <IconCircleCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 text-primary"
                    stroke={1.8}
                  />
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasWorkflowSteps && (
          <div className="mt-3 w-full rounded-lg border border-border/70 bg-background px-3 py-3">
            <ol className="space-y-2.5">
              {workflowSteps.map((step) => (
                <li
                  key={step.id}
                  className="grid grid-cols-[1.65rem_1fr] gap-2"
                >
                  <span className="flex size-6 items-center justify-center rounded-md border border-border bg-muted text-[0.68rem] font-semibold text-foreground">
                    {step.label}
                  </span>
                  <span className="min-w-0 space-y-0.5">
                    <span className="block text-xs font-medium leading-snug text-foreground">
                      {step.title}
                    </span>
                    <span className="block text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {workspaceBoundary ? (
          <AuthWorkspaceBoundaryPanel view={workspaceBoundary} />
        ) : null}
        {trustNote && (
          <div className="mt-3 flex w-full items-start gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            <IconInfoCircle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
              stroke={1.8}
            />
            <span className="min-w-0">{trustNote}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 sm:px-5">{children}</CardContent>
      <CardFooter>
        <BottomLink
          label={bottomButtonLabel}
          href={bottomButtonHref}
          search={bottomButtonSearch}
        />
      </CardFooter>
    </Card>
  );
}

function AuthWorkspaceBoundaryPanel({
  view,
}: {
  view: AuthWorkspaceBoundaryView;
}) {
  const titleId = 'auth-workspace-boundary-title';
  const handoffTitleId = 'auth-workspace-handoff-title';
  const handoffDescriptionId = 'auth-workspace-handoff-description';

  return (
    <>
      <section
        aria-labelledby={titleId}
        className="mt-3 w-full rounded-lg border border-primary/15 bg-primary/5 px-3 py-3 text-left"
      >
        <div className="flex items-start gap-2">
          <IconShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-primary"
            stroke={1.8}
          />
          <div className="min-w-0 space-y-1">
            <p id={titleId} className="text-xs font-medium text-foreground">
              {view.title}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {view.description}
            </p>
          </div>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {view.items.map((item) => {
            const Icon = authWorkspaceBoundaryIcons[item.id];

            return (
              <li key={item.id} className="flex min-w-0 gap-2">
                <Icon
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0 text-primary"
                  stroke={1.8}
                />
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <section
        aria-describedby={handoffDescriptionId}
        aria-labelledby={handoffTitleId}
        className="sr-only"
        data-handoff="auth-workspace-boundary"
      >
        <h2 id={handoffTitleId}>{view.title}</h2>
        <p id={handoffDescriptionId}>{view.description}</p>
        <dl>
          {view.itemViews.map((item) => (
            <div data-handoff-item={item.id} key={item.id}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
              <dd>{item.description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

const authWorkspaceBoundaryIcons = {
  'account-access': IconKey,
  'activity-library': IconListCheck,
  'assignment-links': IconRoute,
  'source-materials': IconShieldCheck,
  'student-results': IconUsers,
} satisfies Record<AuthWorkspaceBoundaryItemId, TablerIcon>;
