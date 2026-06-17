import { m } from '@/locale/paraglide/messages';
import Container from '@/components/layout/container';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import {
  IconArrowRight,
  IconCheck,
  IconFileText,
  IconPencil,
  IconRotate,
} from '@tabler/icons-react';
import { Routes } from '@/lib/routes';

export default function HeroSection() {
  return (
    <section id="hero" className="overflow-hidden">
      {/* background, warm-tinted light blobs on top of the hero section */}
      <div
        aria-hidden="true"
        className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
      >
        <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,oklch(0.85_0.04_55/.12)_0,oklch(0.7_0.02_45/.04)_50%,transparent_80%)]" />
        <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,oklch(0.88_0.05_38/.1)_0,oklch(0.6_0.02_38/.03)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,oklch(0.9_0.03_65/.08)_0,oklch(0.65_0.015_50/.03)_80%,transparent_100%)]" />
      </div>

      <div className="relative pt-12">
        <Container className="px-6">
          <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
            {/* introduction */}
            <Link
              to={Routes.Hsk1}
              className="animate-fade-up delay-0 hover:bg-muted group mx-auto flex w-fit items-center gap-2 rounded-full border border-border p-1 pl-4 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded-full"
            >
              <span className="text-foreground text-sm font-medium">
                {m.home_hero_introduction()}
              </span>
              <div className="size-6 overflow-hidden rounded-full bg-muted duration-500">
                <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                  <span className="flex size-6">
                    <IconArrowRight className="m-auto size-3 text-foreground" />
                  </span>
                  <span className="flex size-6">
                    <IconArrowRight className="m-auto size-3 text-foreground" />
                  </span>
                </div>
              </div>
            </Link>

            {/* title */}
            <h1 className="animate-fade-up delay-1 mt-8 text-balance text-3xl font-bold sm:text-4xl md:text-5xl lg:mt-16 xl:text-[4rem]">
              {m.home_hero_title()}
            </h1>

            {/* description */}
            <p className="animate-fade-up delay-2 mx-auto mt-6 max-w-5xl text-balance text-base text-muted-foreground sm:mt-8 sm:text-lg">
              {m.home_hero_description()}
            </p>

            {/* action buttons */}
            <div className="animate-fade-up delay-3 mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-12 sm:gap-4">
              <div className="bg-foreground/10 rounded-xl">
                <Link
                  to={Routes.Hsk1}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'h-10.5 rounded-xl px-5 text-base'
                  )}
                >
                  <span className="text-nowrap">{m.home_hero_primary()}</span>
                </Link>
              </div>
              <Link
                to={Routes.Worksheets}
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'h-10.5 rounded-xl px-5'
                )}
              >
                <span className="text-nowrap">{m.home_hero_secondary()}</span>
              </Link>
            </div>
          </div>

          {/* images */}
          <div className="animate-fade-up delay-4 relative overflow-hidden px-2 my-8 sm:my-12 md:my-16">
            <ProductPreview />
          </div>
        </Container>
      </div>
    </section>
  );
}

function ProductPreview() {
  const characters = [
    { character: '人', label: 'ren', state: 'done' },
    { character: '口', label: 'kou', state: 'review' },
    { character: '日', label: 'ri', state: 'active' },
    { character: '月', label: 'yue', state: 'next' },
  ];

  return (
    <div className="ring-muted/50 bg-card/80 relative mx-auto max-w-5xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/10 ring-1">
      <div className="grid gap-4 rounded-xl border bg-background p-4 lg:grid-cols-[0.9fr_1.1fr] lg:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                HSK1 Foundations
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                Write 日 with guided strokes
              </h2>
            </div>
            <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm tabular-nums">
              3/10
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {characters.map((item) => (
              <div
                key={item.character}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center rounded-lg border bg-card',
                  item.state === 'done' &&
                    'border-emerald-500/40 bg-emerald-500/10',
                  item.state === 'review' &&
                    'border-amber-500/40 bg-amber-500/10',
                  item.state === 'active' && 'border-primary bg-primary/5'
                )}
              >
                <span className="text-3xl font-semibold leading-none">
                  {item.character}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-3 text-left">
              <div className="flex items-center gap-2 text-sm font-medium">
                <IconPencil className="size-4 text-primary" />
                Guided tracing
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Watch the order, then trace each highlighted stroke.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-left">
              <div className="flex items-center gap-2 text-sm font-medium">
                <IconFileText className="size-4 text-primary" />
                Printable review
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Turn missed strokes into focused handwriting sheets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[20rem] items-center justify-center rounded-xl border bg-muted/20 p-4">
          <div className="relative flex size-64 items-center justify-center rounded-xl border bg-background shadow-sm sm:size-72">
            <div className="absolute inset-6 rounded-lg border border-dashed" />
            <div className="absolute left-1/2 top-6 h-[calc(100%-3rem)] -translate-x-1/2 border-l border-dashed" />
            <div className="absolute top-1/2 left-6 w-[calc(100%-3rem)] -translate-y-1/2 border-t border-dashed" />
            <span className="relative text-9xl font-semibold leading-none">
              日
            </span>
            <div className="absolute right-3 top-3 rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
              Stroke 2
            </div>
            <div className="absolute bottom-3 left-3 flex gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-300">
                <IconCheck className="size-3.5" />
                clean
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-300">
                <IconRotate className="size-3.5" />
                review
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
