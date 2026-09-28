import { TailwindIndicator } from '@/integrations/tailwindcss/tailwind-indicator';

/**
 * Dev-only tools: Tailwind breakpoint indicator.
 * Lazy-loaded in __root.tsx so none of this ships in production.
 */
export default function DevTools() {
  return <TailwindIndicator />;
}
