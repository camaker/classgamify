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
import { IconCircleCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  headerLabel: string;
  benefits?: string[];
  bottomButtonLabel: string;
  bottomButtonHref: string;
  className?: string;
}

export function AuthCard({
  children,
  headerLabel,
  benefits,
  bottomButtonLabel,
  bottomButtonHref,
  className,
}: AuthCardProps) {
  const hasBenefits = benefits && benefits.length > 0;

  return (
    <Card
      className={cn('shadow-xs border border-border pt-6', className)}
      size="default"
    >
      <CardHeader className="flex flex-col items-center">
        <Link to="/">
          <Logo className="mb-2" />
        </Link>
        <CardDescription className="text-center">{headerLabel}</CardDescription>
        {hasBenefits && (
          <div className="mt-3 w-full rounded-lg border border-border/70 bg-muted/35 px-3 py-2.5 text-left">
            <ul className="space-y-2">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="grid grid-cols-[1rem_1fr] gap-2 text-xs leading-relaxed text-muted-foreground"
                >
                  <IconCircleCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 text-primary"
                    stroke={1.8}
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter>
        <BottomLink label={bottomButtonLabel} href={bottomButtonHref} />
      </CardFooter>
    </Card>
  );
}
