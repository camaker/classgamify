import { serverEnv } from '@/env/server';
import type { StorageConfig } from '../types';

/**
 * R2 storage config (uses serverEnv for type-safe runtime vars).
 */
export const storageConfig: StorageConfig = {
  publicUrl: serverEnv.STORAGE_PUBLIC_URL,
};
