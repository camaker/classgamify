import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getFreeCharacters } from '@/learn/hanzi-course';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconCircleCheck,
  IconLock,
  IconPrinter,
  IconRefresh,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

const GRID_OPTIONS = [6, 9, 12] as const;

export function WorksheetPage() {
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getWorksheetCopy(currentLocale);
  const characters = useMemo(
    () => getFreeCharacters(currentLocale),
    [currentLocale]
  );
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>(
    characters.slice(0, 6).map((item) => item.character)
  );
  const [gridCount, setGridCount] = useState<(typeof GRID_OPTIONS)[number]>(9);

  const selectedItems = characters.filter((item) =>
    selectedCharacters.includes(item.character)
  );

  const toggleCharacter = (character: string) => {
    setSelectedCharacters((current) => {
      if (current.includes(character)) {
        return current.filter((item) => item !== character);
      }

      return [...current, character];
    });
  };

  const resetSelection = () => {
    setSelectedCharacters(characters.slice(0, 6).map((item) => item.character));
    setGridCount(9);
  };

  return (
    <section className="min-h-[calc(100vh-12rem)] bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <Link
            to={Routes.Learn}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'w-fit print:hidden'
            )}
          >
            <IconArrowLeft className="size-4" />
            {copy.back}
          </Link>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <div className="space-y-5 print:hidden">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-primary/30">
                    {copy.badge}
                  </Badge>
                  <Badge variant="secondary">{copy.freeBadge}</Badge>
                </div>
                <h1 className="text-balance text-3xl font-semibold tracking-normal sm:text-4xl">
                  {copy.title}
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground">
                  {copy.description}
                </p>
              </div>

              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle>{copy.selectTitle}</CardTitle>
                  <CardDescription>{copy.selectDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-5 gap-2">
                    {characters.map((item) => {
                      const selected = selectedCharacters.includes(
                        item.character
                      );
                      return (
                        <button
                          key={item.character}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleCharacter(item.character)}
                          className={cn(
                            'flex aspect-square flex-col items-center justify-center rounded-lg border bg-card transition-colors',
                            'hover:border-primary/50 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            selected && 'border-primary bg-primary/10'
                          )}
                        >
                          <span className="text-3xl font-semibold">
                            {item.character}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.pinyin}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Practice boxes</p>
                    <div className="flex flex-wrap gap-2">
                      {GRID_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setGridCount(option)}
                          className={cn(
                            'rounded-lg border px-3 py-2 text-sm transition-colors',
                            'hover:border-primary/50 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            gridCount === option &&
                              'border-primary bg-primary/10 text-primary'
                          )}
                        >
                          {copy.gridOption(option)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={() => window.print()}>
                      <IconPrinter className="size-4" />
                      {copy.printCta}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetSelection}
                    >
                      <IconRefresh className="size-4" />
                      {copy.resetCta}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconLock className="size-4" />
                    {copy.packTitle}
                  </CardTitle>
                  <CardDescription>{copy.packDescription}</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="rounded-lg border bg-background p-4 shadow-sm print:border-0 print:p-0 print:shadow-none">
              <WorksheetPreview
                copy={copy}
                gridCount={gridCount}
                selectedItems={selectedItems}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type WorksheetPreviewProps = {
  copy: WorksheetCopy;
  selectedItems: ReturnType<typeof getFreeCharacters>;
  gridCount: number;
};

function WorksheetPreview({
  copy,
  selectedItems,
  gridCount,
}: WorksheetPreviewProps) {
  return (
    <div className="mx-auto max-w-[820px] bg-white p-6 text-slate-950 print:max-w-none print:p-0">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Lang Study
          </p>
          <h2 className="mt-1 text-2xl font-semibold">{copy.previewTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {copy.nameLabel}: ____________________ {copy.dateLabel}:
            ____________________
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          {copy.characterCount(selectedItems.length)}
        </div>
      </div>

      {selectedItems.length > 0 ? (
        <div className="space-y-6">
          {selectedItems.map((item) => (
            <section key={item.character} className="break-inside-avoid">
              <div className="mb-2 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="flex size-16 items-center justify-center rounded-lg border border-slate-300 text-4xl font-semibold">
                  {item.character}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {item.character} · {item.pinyin}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {item.meaning} · {item.hint}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {copy.examplesLabel}: {item.examples.join(', ')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {Array.from({ length: gridCount }).map((_, index) => (
                  <PracticeBox
                    key={`${item.character}-${index}`}
                    character={index === 0 ? item.character : undefined}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-slate-300 text-center text-sm text-slate-500">
          {copy.empty}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500">
        <IconCircleCheck className="size-4" />
        {copy.footerTip}
      </div>
    </div>
  );
}

type WorksheetCopy = ReturnType<typeof getWorksheetCopy>;

function getWorksheetCopy(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      back: '返回练习',
      badge: '练习纸生成器',
      characterCount: (count: number) => `${count} 个汉字`,
      dateLabel: '日期',
      description:
        '从免费 HSK1 入门组里选择汉字，生成一张干净的手写练习纸，适合自学、家长辅导和老师布置作业。',
      empty: '至少选择一个汉字来生成练习纸。',
      examplesLabel: '例词',
      footerTip: '慢慢练：先描第一格，再尝试凭记忆书写。',
      freeBadge: '免费预览',
      gridOption: (count: number) => `每字 ${count} 格`,
      nameLabel: '姓名',
      packDescription:
        '完整版本将提供 HSK1 全量练习纸、自定义字表、答案提示和学生作业记录。',
      packTitle: '完整练习纸套装',
      previewTitle: 'HSK1 汉字书写练习',
      printCta: '打印练习纸',
      resetCta: '重置',
      selectDescription:
        '完整 HSK1 套装将支持自定义字表、保存作业和更多打印格式。',
      selectTitle: '选择汉字',
      title: '打印中文汉字书写练习纸',
    };
  }

  return {
    back: 'Back to practice',
    badge: 'Worksheet generator',
    characterCount: (count: number) => `${count} characters`,
    dateLabel: 'Date',
    description:
      'Pick characters from the free HSK1 starter set and print a clean handwriting worksheet for self-study, tutoring, or classroom practice.',
    empty: 'Select at least one character to build a worksheet.',
    examplesLabel: 'Examples',
    footerTip: 'Practice slowly: trace the first box, then write from memory.',
    freeBadge: 'Free preview',
    gridOption: (count: number) => `${count} per character`,
    nameLabel: 'Name',
    packDescription:
      'The complete version will unlock full HSK1 worksheets, custom character lists, answer prompts, and saved student assignments.',
    packTitle: 'Complete worksheet pack',
    previewTitle: 'HSK1 Chinese Character Practice',
    printCta: 'Print worksheet',
    resetCta: 'Reset',
    selectDescription:
      'The full HSK1 pack will support custom lists, saved assignments, and more printable formats.',
    selectTitle: 'Select characters',
    title: 'Print Chinese character practice sheets',
  };
}

function PracticeBox({ character }: { character?: string }) {
  return (
    <div className="relative aspect-square border border-slate-300">
      <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-200" />
      <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-200" />
      <div className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-slate-300">
        {character}
      </div>
    </div>
  );
}
