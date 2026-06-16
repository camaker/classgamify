import { WorksheetPage } from '@/components/learn/worksheet-page';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/worksheets')({
  validateSearch: (
    search
  ): {
    characters?: string[];
  } => ({
    characters: parseCharactersSearch(search.characters),
  }),
  head: () =>
    seo('/worksheets', {
      title: `Chinese Character Worksheet Generator | ${websiteConfig.metadata?.name}`,
      description:
        'Create printable HSK1 Chinese character handwriting worksheets from the Lang Study starter set.',
    }),
  component: WorksheetRoutePage,
});

function WorksheetRoutePage() {
  const search = Route.useSearch();
  return <WorksheetPage initialCharacters={search.characters} />;
}

function parseCharactersSearch(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value !== 'string') return undefined;

  const characters = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return characters.length > 0 ? characters : undefined;
}
