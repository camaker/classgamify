import type {
  buildActivityEditorModeView,
  buildActivityEditorTemplateView,
} from '@/activities/editor';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { m } from '@/locale/paraglide/messages';
import { cn } from '@/lib/utils';
import {
  IconDeviceFloppy,
  IconLoader2,
  IconLogin2,
  IconSparkles,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type ActivityEditorModeView = ReturnType<typeof buildActivityEditorModeView>;

type ActivityEditorTemplateView = ReturnType<
  typeof buildActivityEditorTemplateView
>;

type ActivityEditorHeaderProps = {
  modeView: ActivityEditorModeView;
  template: ActivityEditorTemplateView['template'];
};

type ActivityEditorFooterProps = {
  isPending: boolean;
  loginAction: {
    search: {
      callbackUrl: string;
    };
    to: string;
  };
  modeView: ActivityEditorModeView;
  showSaveAction: boolean;
};

export function ActivityEditorHeader({
  modeView,
  template,
}: ActivityEditorHeaderProps) {
  return (
    <CardHeader>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-md border-primary/30">
          <IconSparkles className="size-3.5" />
          {m.activity_form_editor_badge()}
        </Badge>
        <Badge variant="secondary" className="rounded-md">
          {template.name}
        </Badge>
      </div>
      <CardTitle>
        <h2 className="text-xl font-semibold">{modeView.title}</h2>
      </CardTitle>
    </CardHeader>
  );
}

export function ActivityEditorFooter({
  isPending,
  loginAction,
  modeView,
  showSaveAction,
}: ActivityEditorFooterProps) {
  return (
    <CardFooter className="mt-6 flex flex-col gap-3 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">{modeView.footerHint}</p>
      {showSaveAction ? (
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconDeviceFloppy className="size-4" />
          )}
          {modeView.saveLabel}
        </Button>
      ) : (
        <Link
          to={loginAction.to}
          search={loginAction.search}
          className={cn(buttonVariants(), 'w-full sm:w-auto')}
        >
          <IconLogin2 className="size-4" />
          {m.activity_form_sign_in_to_save()}
        </Link>
      )}
    </CardFooter>
  );
}
