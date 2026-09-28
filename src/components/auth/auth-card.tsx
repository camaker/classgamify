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
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  eyebrow?: string;
  headerLabel: string;
  description?: string;
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
  bottomButtonLabel,
  bottomButtonHref,
  bottomButtonSearch,
  className,
}: AuthCardProps) {
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
