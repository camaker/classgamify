import type { CreditPackageConfig } from '../types';
import { websiteConfig } from './website';

/** Credit package with display copy (English) */
export interface CreditPackageDisplay extends CreditPackageConfig {
  name: string;
  description: string;
}

/**
 * Credit packages with English display copy. Use in credits / purchase UI.
 */
export function getCreditPackages(): Record<string, CreditPackageDisplay> {
  const packages: Record<string, CreditPackageDisplay> = {};
  const config = websiteConfig.credits?.packages;
  if (!config) return packages;

  if (config.basic) {
    packages.basic = {
      ...config.basic,
      name: 'Basic',
      description: 'Starter credit pack',
    };
  }
  if (config.standard) {
    packages.standard = {
      ...config.standard,
      name: 'Standard',
      description: 'Most popular',
    };
  }
  if (config.premium) {
    packages.premium = {
      ...config.premium,
      name: 'Premium',
      description: 'Best value',
    };
  }
  if (config.enterprise) {
    packages.enterprise = {
      ...config.enterprise,
      name: 'Enterprise',
      description: 'For heavy usage',
    };
  }
  return packages;
}
