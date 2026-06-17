import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getFreeCharacters } from '@/learn/hanzi-course';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconCircleCheck,
  IconClipboardText,
  IconCopy,
  IconEraser,
  IconLock,
  IconPrinter,
  IconRefresh,
  IconX,
  IconWorldWww,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const GRID_OPTIONS = [6, 9, 12] as const;
const MAX_WORKSHEET_CHARACTERS = 12;
const WORKSHEET_PRINT_MODE = 'worksheet';
const WORKSHEET_DOMAIN = 'getlangstudy.com';
const WORKSHEET_URL = 'getlangstudy.com/worksheets';
const HANZI_CHARACTER_PATTERN = /\p{Script=Han}/gu;
const STARTER_SET_SIZE = 6;

type WorksheetCharacter = ReturnType<typeof getFreeCharacters>[number] & {
  custom?: boolean;
};

type WorksheetQuickSet = {
  characters: string[];
  description: string;
  id: string;
  title: string;
};

function enableWorksheetPrintMode() {
  document.body.dataset.printMode = WORKSHEET_PRINT_MODE;
}

function clearWorksheetPrintMode() {
  if (document.body.dataset.printMode === WORKSHEET_PRINT_MODE) {
    delete document.body.dataset.printMode;
  }
}

export function WorksheetPage({
  initialCharacters,
}: {
  initialCharacters?: string[];
}) {
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getWorksheetCopy(currentLocale);
  const characters = useMemo(
    () => getFreeCharacters(currentLocale),
    [currentLocale]
  );
  const characterMap = useMemo(
    () => new Map(characters.map((item) => [item.character, item])),
    [characters]
  );
  const initialSelectedCharacters = useMemo(() => {
    const normalized = normalizeHanziCharacters(initialCharacters?.join(''));
    if (normalized.length > 0) {
      return normalized.slice(0, MAX_WORKSHEET_CHARACTERS);
    }
    return characters.slice(0, 6).map((item) => item.character);
  }, [characters, initialCharacters]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>(
    initialSelectedCharacters
  );
  const [customInput, setCustomInput] = useState('');
  const [gridCount, setGridCount] = useState<(typeof GRID_OPTIONS)[number]>(9);
  const quickSets = useMemo(
    () => createWorksheetQuickSets(characters, copy),
    [characters, copy]
  );

  useEffect(() => {
    setSelectedCharacters(initialSelectedCharacters);
  }, [initialSelectedCharacters]);

  useEffect(() => {
    window.addEventListener('beforeprint', enableWorksheetPrintMode);
    window.addEventListener('afterprint', clearWorksheetPrintMode);

    return () => {
      window.removeEventListener('beforeprint', enableWorksheetPrintMode);
      window.removeEventListener('afterprint', clearWorksheetPrintMode);
      clearWorksheetPrintMode();
    };
  }, []);

  const parsedCustomCharacters = useMemo(
    () => normalizeHanziCharacters(customInput),
    [customInput]
  );
  const customOverflowCount = Math.max(
    0,
    parsedCustomCharacters.length - MAX_WORKSHEET_CHARACTERS
  );
  const selectedItems = selectedCharacters.map(
    (character) =>
      characterMap.get(character) ??
      createCustomWorksheetCharacter(character, copy)
  );

  const shareUrl = useMemo(() => {
    const params = new URLSearchParams();
    for (const character of selectedCharacters) {
      params.append('characters', character);
    }
    return `${Routes.Worksheets}?${params.toString()}`;
  }, [selectedCharacters]);

  const toggleCharacter = (character: string) => {
    const selectionIsFull =
      !selectedCharacters.includes(character) &&
      selectedCharacters.length >= MAX_WORKSHEET_CHARACTERS;

    if (selectionIsFull) {
      toast.error(copy.selectionLimit(MAX_WORKSHEET_CHARACTERS));
      return;
    }

    setSelectedCharacters((current) => {
      if (current.includes(character)) {
        return current.filter((item) => item !== character);
      }

      if (current.length >= MAX_WORKSHEET_CHARACTERS) {
        return current;
      }

      return [...current, character];
    });
  };

  const applyCustomCharacters = () => {
    setSelectedCharacters(
      parsedCustomCharacters.slice(0, MAX_WORKSHEET_CHARACTERS)
    );
  };

  const applyQuickSet = (quickSet: WorksheetQuickSet) => {
    setSelectedCharacters(
      quickSet.characters.slice(0, MAX_WORKSHEET_CHARACTERS)
    );
    setCustomInput('');
  };

  const resetSelection = () => {
    setSelectedCharacters(initialSelectedCharacters);
    setCustomInput('');
    setGridCount(9);
  };

  const clearSelection = () => {
    setSelectedCharacters([]);
  };

  const printWorksheet = () => {
    if (selectedCharacters.length === 0) {
      toast.error(copy.printEmptyError);
      return;
    }

    enableWorksheetPrintMode();
    window.requestAnimationFrame(() => {
      window.print();
    });
  };

  const copyShareLink = async () => {
    if (typeof window === 'undefined') return;

    const url = new URL(shareUrl, window.location.origin).toString();

    try {
      await window.navigator.clipboard.writeText(url);
      toast.success(copy.shareSuccess);
    } catch {
      toast.error(copy.shareError);
    }
  };

  return (
    <section
      className="min-h-[calc(100vh-12rem)] bg-background"
      data-print-page="worksheet"
    >
      <div
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8"
        data-print-shell
      >
        <div className="flex flex-col gap-4">
          <Link
            to={Routes.Learn}
            data-print-hidden
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'w-fit print:hidden'
            )}
          >
            <IconArrowLeft className="size-4" />
            {copy.back}
          </Link>

          <div
            className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start"
            data-print-layout
          >
            <div className="space-y-5 print:hidden" data-print-hidden>
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
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">
                        {copy.quickSetsTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {copy.quickSetsDescription}
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {quickSets.map((quickSet) => {
                        const active = isSameSelection(
                          selectedCharacters,
                          quickSet.characters
                        );

                        return (
                          <button
                            key={quickSet.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => applyQuickSet(quickSet)}
                            className={cn(
                              'rounded-lg border bg-background p-3 text-left transition-colors',
                              'hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              active && 'border-primary bg-primary/10'
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium">
                                {quickSet.title}
                              </span>
                              <Badge variant="outline" className="rounded-md">
                                {copy.quickSetCount(quickSet.characters.length)}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {quickSet.description}
                            </p>
                            <p className="mt-2 truncate text-sm font-semibold">
                              {quickSet.characters.join(' ')}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

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

                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {copy.selectedTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {copy.selectedDescription(
                            selectedCharacters.length,
                            MAX_WORKSHEET_CHARACTERS
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-md">
                          {copy.selectedCount(
                            selectedCharacters.length,
                            MAX_WORKSHEET_CHARACTERS
                          )}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearSelection}
                          disabled={selectedCharacters.length === 0}
                          className="h-7 px-2 text-xs text-muted-foreground"
                        >
                          <IconEraser className="size-3.5" />
                          {copy.clearSelectionCta}
                        </Button>
                      </div>
                    </div>
                    {selectedItems.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedItems.map((item) => (
                          <button
                            key={item.character}
                            type="button"
                            onClick={() => toggleCharacter(item.character)}
                            className={cn(
                              'inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-2 text-sm transition-colors',
                              'hover:border-primary/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                            )}
                            aria-label={copy.removeCharacter(item.character)}
                          >
                            <span className="font-semibold">
                              {item.character}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.custom
                                ? copy.customCharacterLabel
                                : item.pinyin}
                            </span>
                            <IconX className="size-3.5 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-md border border-dashed bg-background p-3 text-sm text-muted-foreground">
                        {copy.selectedEmpty}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="custom-worksheet-characters"
                      className="text-sm font-medium"
                    >
                      {copy.customTitle}
                    </label>
                    <Textarea
                      id="custom-worksheet-characters"
                      value={customInput}
                      onChange={(event) => setCustomInput(event.target.value)}
                      placeholder={copy.customPlaceholder}
                      className="min-h-24 resize-none"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {copy.customCount(
                          Math.min(
                            parsedCustomCharacters.length,
                            MAX_WORKSHEET_CHARACTERS
                          ),
                          MAX_WORKSHEET_CHARACTERS
                        )}
                      </span>
                      {customOverflowCount > 0 ? (
                        <Link
                          to={Routes.Pricing}
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {copy.customOverflow(customOverflowCount)}
                        </Link>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={applyCustomCharacters}
                      disabled={parsedCustomCharacters.length === 0}
                    >
                      <IconClipboardText className="size-4" />
                      {copy.customApplyCta}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {copy.practiceBoxesLabel}
                    </p>
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
                    <Button
                      type="button"
                      onClick={printWorksheet}
                      disabled={selectedCharacters.length === 0}
                    >
                      <IconPrinter className="size-4" />
                      {copy.printCta}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={copyShareLink}
                      disabled={selectedCharacters.length === 0}
                    >
                      <IconCopy className="size-4" />
                      {copy.shareCta}
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

            <div
              className="rounded-lg border bg-background p-4 shadow-sm print:border-0 print:p-0 print:shadow-none"
              data-print-preview-frame
            >
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
  selectedItems: WorksheetCharacter[];
  gridCount: number;
};

function WorksheetPreview({
  copy,
  selectedItems,
  gridCount,
}: WorksheetPreviewProps) {
  return (
    <div
      className="mx-auto max-w-[820px] bg-white p-6 text-slate-950 print:max-w-none print:p-0"
      data-print-root
    >
      <div
        className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-4"
        data-print-header
      >
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
        <div
          className="min-w-44 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          data-print-brand
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <IconWorldWww className="size-3.5" />
            {copy.sourceLabel}
          </div>
          <div className="mt-1 font-semibold text-slate-950">
            {WORKSHEET_DOMAIN}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {copy.characterCount(selectedItems.length)}
          </div>
        </div>
      </div>

      <div
        className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.55fr)]"
        data-print-assignment
      >
        <div>
          <div className="font-semibold text-slate-950">
            {copy.assignmentTitle}
          </div>
          <p className="mt-1 leading-6 text-slate-600">
            {copy.assignmentDescription}
          </p>
        </div>
        <div className="grid gap-2 text-xs text-slate-700">
          {copy.assignmentChecks.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <span
                className="mt-0.5 size-3.5 shrink-0 rounded-sm border border-slate-400 bg-white"
                aria-hidden="true"
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedItems.length > 0 ? (
        <div className="space-y-6">
          {selectedItems.map((item) => (
            <section
              key={item.character}
              className="break-inside-avoid"
              data-print-character
            >
              <div className="mb-2 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="flex size-16 items-center justify-center rounded-lg border border-slate-300 text-4xl font-semibold">
                  {item.character}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {item.character} ·{' '}
                    {item.custom ? copy.customCharacterLabel : item.pinyin}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {item.custom
                      ? copy.customCharacterDescription
                      : `${item.meaning} · ${item.hint}`}
                  </p>
                  {item.examples.length > 0 ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {copy.examplesLabel}: {item.examples.join(', ')}
                    </p>
                  ) : null}
                </div>
              </div>

              <div
                className="grid grid-cols-3 gap-2 sm:grid-cols-6"
                data-print-grid
              >
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

      <div
        className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500"
        data-print-footer
      >
        <div className="flex min-w-0 items-center gap-2">
          <IconCircleCheck className="size-4 shrink-0" />
          <span>{copy.footerTip}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 font-medium text-slate-700">
          <IconWorldWww className="size-4 shrink-0" />
          <span>
            {copy.footerSourcePrefix}{' '}
            <span className="font-semibold text-slate-950">
              {WORKSHEET_URL}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

type WorksheetCopy = ReturnType<typeof getWorksheetCopy>;

function getWorksheetCopy(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      assignmentChecks: [
        '先观察每个字的结构和例词',
        '描第一格，再独立写完后面的格子',
        '圈出最难的一笔，下次先复习',
      ],
      assignmentDescription:
        '建议每个汉字先读拼音和例词，再慢慢书写。完成后把最容易写错的字加入下一次复习。',
      assignmentTitle: '练习任务',
      back: '返回练习',
      badge: '练习纸生成器',
      characterCount: (count: number) => `${count} 个汉字`,
      clearSelectionCta: '清空',
      customApplyCta: '使用自定义字表',
      customCharacterDescription: '自定义汉字，适合课堂、作业或个人复习。',
      customCharacterLabel: '自定义',
      customCount: (count: number, limit: number) =>
        `${count}/${limit} 个可打印汉字`,
      customHint: '先观察结构，再慢慢书写。',
      customMeaning: '自定义汉字',
      customOverflow: (count: number) => `${count} 个字将在 Pro 中解锁`,
      customPlaceholder: '粘贴汉字，例如：你好学习中文',
      customTitle: '粘贴自定义字表',
      dateLabel: '日期',
      description:
        '从免费 HSK1 入门组里选择汉字，生成一张干净的手写练习纸，适合自学、家长辅导和老师布置作业。',
      empty: '至少选择一个汉字来生成练习纸。',
      examplesLabel: '例词',
      footerSourcePrefix: '更多练习纸：',
      footerTip: '慢慢练：先描第一格，再尝试凭记忆书写。',
      freeBadge: '免费预览',
      gridOption: (count: number) => `每字 ${count} 格`,
      nameLabel: '姓名',
      packDescription:
        '完整版本将提供 HSK1 全量练习纸、自定义字表、答案提示和学生作业记录。',
      packTitle: '完整练习纸套装',
      previewTitle: 'HSK1 汉字书写练习',
      printEmptyError: '请先选择至少一个汉字。',
      printCta: '打印练习纸',
      practiceBoxesLabel: '练习格数量',
      quickSetCount: (count: number) => `${count} 字`,
      quickSets: {
        foundations: {
          description: '先练结构最清楚、最适合第一次书写的基础字。',
          title: '基础象形字',
        },
        fullFree: {
          description: '把当前免费开放的 HSK1 入门字一次生成出来。',
          title: '全部免费字',
        },
        nature: {
          description: '适合用图像联想记住笔顺方向的一组字。',
          title: '自然字',
        },
        starter: {
          description: '适合第一节课、家庭作业或 10 分钟复习。',
          title: '入门 6 字',
        },
      },
      quickSetsDescription: '一键套用常用作业组合，再按需要微调。',
      quickSetsTitle: '快速练习包',
      resetCta: '重置',
      removeCharacter: (character: string) => `移除 ${character}`,
      selectDescription:
        '完整 HSK1 套装将支持自定义字表、保存作业和更多打印格式。',
      selectTitle: '选择汉字',
      selectedCount: (count: number, limit: number) => `${count}/${limit}`,
      selectedDescription: (count: number, limit: number) =>
        `这张练习纸会打印 ${count} 个汉字，免费预览最多 ${limit} 个。`,
      selectedEmpty: '从上方选择汉字，或粘贴自定义字表。',
      selectedTitle: '当前练习纸',
      selectionLimit: (limit: number) => `免费预览最多选择 ${limit} 个汉字。`,
      shareCta: '复制练习纸链接',
      shareError: '复制失败，请稍后重试。',
      shareSuccess: '练习纸链接已复制。',
      sourceLabel: '生成来源',
      title: '打印中文汉字书写练习纸',
    };
  }

  return {
    assignmentChecks: [
      'Read the shape cue and example words first',
      'Trace the first box, then write from memory',
      'Circle the hardest stroke for the next review',
    ],
    assignmentDescription:
      'Read each character aloud, study the structure, then write slowly. When finished, mark the characters that should come back in the next review session.',
    assignmentTitle: 'Practice task',
    back: 'Back to practice',
    badge: 'Worksheet generator',
    characterCount: (count: number) => `${count} characters`,
    clearSelectionCta: 'Clear selection',
    customApplyCta: 'Use custom list',
    customCharacterDescription:
      'Custom character for classroom, homework, or personal review.',
    customCharacterLabel: 'custom',
    customCount: (count: number, limit: number) =>
      `${count}/${limit} printable characters`,
    customHint: 'Study the structure first, then write slowly.',
    customMeaning: 'custom character',
    customOverflow: (count: number) => `${count} more unlock with Pro`,
    customPlaceholder: 'Paste characters, e.g. 你好学习中文',
    customTitle: 'Paste a custom list',
    dateLabel: 'Date',
    description:
      'Pick characters from the free HSK1 starter set and print a clean handwriting worksheet for self-study, tutoring, or classroom practice.',
    empty: 'Select at least one character to build a worksheet.',
    examplesLabel: 'Examples',
    footerSourcePrefix: 'Make more worksheets:',
    footerTip: 'Practice slowly: trace the first box, then write from memory.',
    freeBadge: 'Free preview',
    gridOption: (count: number) => `${count} per character`,
    nameLabel: 'Name',
    packDescription:
      'The complete version will unlock full HSK1 worksheets, custom character lists, answer prompts, and saved student assignments.',
    packTitle: 'Complete worksheet pack',
    previewTitle: 'HSK1 Chinese Character Practice',
    printEmptyError: 'Select at least one character before printing.',
    printCta: 'Print worksheet',
    practiceBoxesLabel: 'Practice boxes',
    quickSetCount: (count: number) => `${count} chars`,
    quickSets: {
      foundations: {
        description:
          'Start with compact shapes that are easiest to write first.',
        title: 'Foundation shapes',
      },
      fullFree: {
        description:
          'Generate every currently available free HSK1 starter character.',
        title: 'All free characters',
      },
      nature: {
        description:
          'Use visual characters that make stroke direction easier to recall.',
        title: 'Nature shapes',
      },
      starter: {
        description: 'Good for a first class, homework, or 10-minute review.',
        title: 'Starter six',
      },
    },
    quickSetsDescription:
      'Apply a common assignment set, then adjust the worksheet if needed.',
    quickSetsTitle: 'Quick sets',
    resetCta: 'Reset',
    removeCharacter: (character: string) => `Remove ${character}`,
    selectDescription:
      'The full HSK1 pack will support custom lists, saved assignments, and more printable formats.',
    selectTitle: 'Select characters',
    selectedCount: (count: number, limit: number) => `${count}/${limit}`,
    selectedDescription: (count: number, limit: number) =>
      `This worksheet will print ${count} characters. Free preview supports up to ${limit}.`,
    selectedEmpty: 'Select characters above, or paste a custom list.',
    selectedTitle: 'Current worksheet',
    selectionLimit: (limit: number) =>
      `Free preview supports up to ${limit} characters.`,
    shareCta: 'Copy worksheet link',
    shareError: 'Could not copy the link. Please try again.',
    shareSuccess: 'Worksheet link copied.',
    sourceLabel: 'Created with',
    title: 'Print Chinese character practice sheets',
  };
}

function createWorksheetQuickSets(
  characters: WorksheetCharacter[],
  copy: WorksheetCopy
): WorksheetQuickSet[] {
  const charactersByLesson = new Map<string, string[]>();

  for (const item of characters) {
    const lessonCharacters = charactersByLesson.get(item.lesson) ?? [];
    lessonCharacters.push(item.character);
    charactersByLesson.set(item.lesson, lessonCharacters);
  }

  return [
    {
      characters: characters
        .slice(0, STARTER_SET_SIZE)
        .map((item) => item.character),
      description: copy.quickSets.starter.description,
      id: 'starter',
      title: copy.quickSets.starter.title,
    },
    {
      characters: charactersByLesson.get('Foundations') ?? [],
      description: copy.quickSets.foundations.description,
      id: 'foundations',
      title: copy.quickSets.foundations.title,
    },
    {
      characters: charactersByLesson.get('Nature') ?? [],
      description: copy.quickSets.nature.description,
      id: 'nature',
      title: copy.quickSets.nature.title,
    },
    {
      characters: characters.map((item) => item.character),
      description: copy.quickSets.fullFree.description,
      id: 'full-free',
      title: copy.quickSets.fullFree.title,
    },
  ].filter((quickSet) => quickSet.characters.length > 0);
}

function isSameSelection(current: string[], next: string[]) {
  return (
    current.length === next.length &&
    current.every((character, index) => character === next[index])
  );
}

function normalizeHanziCharacters(value = '') {
  return Array.from(value.matchAll(HANZI_CHARACTER_PATTERN)).reduce<string[]>(
    (characters, match) => {
      const character = match[0];
      if (!characters.includes(character)) {
        characters.push(character);
      }
      return characters;
    },
    []
  );
}

function createCustomWorksheetCharacter(
  character: string,
  copy: WorksheetCopy
): WorksheetCharacter {
  return {
    character,
    custom: true,
    examples: [],
    hint: copy.customHint,
    lesson: 'Foundations',
    lessonLabel: copy.customCharacterLabel,
    meaning: copy.customMeaning,
    pinyin: copy.customCharacterLabel,
    strokes: 0,
  };
}

function PracticeBox({ character }: { character?: string }) {
  return (
    <div
      className="relative aspect-square border border-slate-300"
      data-print-practice-box
    >
      <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-200" />
      <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-200" />
      <div className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-slate-300">
        {character}
      </div>
    </div>
  );
}
