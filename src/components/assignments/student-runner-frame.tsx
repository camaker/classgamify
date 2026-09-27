import { Logo } from '@/components/shared/logo';
import { websiteConfig } from '@/config/website';
import type { ReactNode } from 'react';

type StudentRunnerFrameProps = {
  children: ReactNode;
};

/**
 * Focused layout for public student play links. Students get the brand mark
 * and the activity only: no marketing navigation, footer, or teacher links.
 */
export function StudentRunnerFrame({ children }: StudentRunnerFrameProps) {
  const name = websiteConfig.metadata?.name ?? 'ClassGamify';

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-2 px-4">
          <Logo className="size-7" />
          <span className="font-semibold text-sm">{name}</span>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 pt-6 pb-40 md:pt-10">
        {children}
      </div>
    </div>
  );
}
