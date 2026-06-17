import { HanziPracticePage } from '@/components/learn/hanzi-practice-page';
import { m } from '@/locale/paraglide/messages';
import { getPracticeTargetCharacter } from '@/learn/hanzi-course';
import { parseCharactersSearch } from '@/lib/character-search';
import { getLocale, localeConfig } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { getCanonicalUrl } from '@/lib/urls';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/learn')({
  validateSearch: (
    search
  ): {
    character?: string;
    characters?: string[];
  } => ({
    character:
      typeof search.character === 'string' ? search.character : undefined,
    characters: parseCharactersSearch(search.characters),
  }),
  head: () => {
    const title = m.learn_seo_title();
    const description = m.learn_seo_description();
    const url = getCanonicalUrl(Routes.Learn);
    const inLanguage = localeConfig[getLocale()].hreflang;
    const courseJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: title,
      description,
      url,
      inLanguage,
    };
    const metadata = seo(Routes.Learn, { title, description });

    return {
      ...metadata,
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(courseJsonLd),
        },
      ],
    };
  },
  component: LearnRoutePage,
});

function LearnRoutePage() {
  const { character, characters } = Route.useSearch();
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const initialCharacter = character
    ? getPracticeTargetCharacter(character, currentLocale)
    : undefined;
  return (
    <HanziPracticePage
      initialCharacter={initialCharacter}
      initialCharacters={characters}
    />
  );
}
