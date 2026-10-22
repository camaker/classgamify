import { getActivityTemplates } from '@/activities/catalog';
import type {
  ActivityTemplateContentRequirement,
  ActivityTemplateType,
} from '@/activities/types';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';
import { TEMPLATE_GUIDE_PATHS } from '@/pages/template-guide-content';

export type HomeGuideStepId = 'publish' | 'results' | 'template';

type HomeGuideTemplateLink = {
  description: string;
  /** English template guide; other locales link to the template directory. */
  guideHref: string | null;
  directoryTo: typeof Routes.Templates;
  name: string;
  type: ActivityTemplateType;
};

type HomeGuideFaq = {
  answer: string;
  question: string;
};

type HomeGuideMoreLink = {
  label: string;
  to:
    | typeof Routes.Blog
    | typeof Routes.Pricing
    | typeof Routes.Teachers
    | typeof Routes.Worksheets;
};

type HomeGuideView = {
  examples: {
    allAction: { label: string; to: typeof Routes.Templates };
    description: string;
    eyebrow: string;
    templates: HomeGuideTemplateLink[];
    title: string;
  };
  faq: {
    eyebrow: string;
    items: HomeGuideFaq[];
    title: string;
  };
  more: {
    links: HomeGuideMoreLink[];
    title: string;
  };
  steps: {
    eyebrow: string;
    items: { description: string; id: HomeGuideStepId; title: string }[];
    title: string;
  };
};

/**
 * Joins localized template names with the locale's own list separator.
 *
 * Deliberately avoids `Intl.ListFormat`: the server (workerd) and the browser
 * ship different ICU data, so its output can differ between SSR and hydration.
 * A message-catalog separator renders the same string everywhere, and the
 * same string feeds both the visible FAQ and its JSON-LD.
 */
function joinTemplateNames(names: string[]) {
  return names.join(m.activity_library_template_list_separator());
}

export function getTemplateNamesByRequirement(
  requirement: ActivityTemplateContentRequirement
) {
  return joinTemplateNames(
    getActivityTemplates()
      .filter((template) => template.contentRequirements.includes(requirement))
      .map((template) => template.name)
  );
}

export function buildHomeGuideView(): HomeGuideView {
  const isEnglish = getLocale() === 'en';
  const templates = getActivityTemplates();

  return {
    steps: {
      eyebrow: m.home_guide_steps_eyebrow(),
      title: m.home_guide_steps_title(),
      items: [
        {
          id: 'template',
          title: m.home_guide_steps_1_title(),
          description: m.home_guide_steps_1_description(),
        },
        {
          id: 'publish',
          title: m.home_guide_steps_2_title(),
          description: m.home_guide_steps_2_description(),
        },
        {
          id: 'results',
          title: m.home_guide_steps_3_title(),
          description: m.home_guide_steps_3_description(),
        },
      ],
    },
    examples: {
      eyebrow: m.home_guide_examples_eyebrow(),
      title: m.home_guide_examples_title(),
      description: m.home_guide_examples_description(),
      allAction: {
        label: m.home_guide_examples_all(),
        to: Routes.Templates,
      },
      templates: templates.map((template) => ({
        description: template.description,
        guideHref: isEnglish ? TEMPLATE_GUIDE_PATHS[template.type] : null,
        directoryTo: Routes.Templates,
        name: template.name,
        type: template.type,
      })),
    },
    faq: {
      eyebrow: m.home_guide_faq_eyebrow(),
      title: m.home_guide_faq_title(),
      items: [
        {
          question: m.home_guide_faq_1_question(),
          answer: m.home_guide_faq_1_answer(),
        },
        {
          question: m.home_guide_faq_2_question(),
          answer: m.home_guide_faq_2_answer(),
        },
        {
          question: m.home_guide_faq_3_question(),
          answer: m.home_guide_faq_3_answer({
            templates: joinTemplateNames(
              templates.map((template) => template.name)
            ),
          }),
        },
        {
          question: m.home_guide_faq_4_question(),
          answer: m.home_guide_faq_4_answer(),
        },
        {
          question: m.home_guide_faq_5_question(),
          answer: m.home_guide_faq_5_answer(),
        },
        {
          question: m.home_guide_faq_6_question(),
          answer: m.home_guide_faq_6_answer(),
        },
      ],
    },
    more: {
      title: m.home_guide_more_title(),
      links: [
        { label: m.home_guide_more_teachers(), to: Routes.Teachers },
        { label: m.home_guide_more_worksheets(), to: Routes.Worksheets },
        { label: m.home_guide_more_blog(), to: Routes.Blog },
        { label: m.home_guide_more_pricing(), to: Routes.Pricing },
      ],
    },
  };
}
