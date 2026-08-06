import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  const name = websiteConfig.metadata?.name ?? 'App';
  const navigationLogo = '/favicon-32x32.png';

  return (
    <>
      <img
        src={navigationLogo}
        alt={m.common_logo_alt({ name })}
        className={cn('size-8 rounded-md dark:hidden', className)}
        width={32}
        height={32}
        decoding="async"
      />
      <img
        src={navigationLogo}
        alt={m.common_logo_alt({ name })}
        className={cn('size-8 rounded-md hidden dark:block', className)}
        width={32}
        height={32}
        decoding="async"
      />
    </>
  );
}
