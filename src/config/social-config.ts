import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';

/** Social link key for UI to map to icon component */
export interface SocialLinkItem extends Pick<MenuItemConfig, 'title' | 'href'> {
  key:
    | 'github'
    | 'twitter'
    | 'blueSky'
    | 'mastodon'
    | 'discord'
    | 'youtube'
    | 'linkedin'
    | 'facebook'
    | 'instagram'
    | 'tiktok'
    | 'telegram'
    | 'email';
}

/**
 * Social links from websiteConfig.metadata.social and mail.supportEmail (English labels).
 */
export function getSocialLinks(): SocialLinkItem[] {
  const social: SocialLinkItem[] = [];
  const meta = websiteConfig.metadata?.social;

  if (meta?.github) {
    social.push({ title: 'GitHub', href: meta.github, key: 'github' });
  }
  if (meta?.twitter) {
    social.push({ title: 'Twitter', href: meta.twitter, key: 'twitter' });
  }
  if (meta?.blueSky) {
    social.push({ title: 'Bluesky', href: meta.blueSky, key: 'blueSky' });
  }
  if (meta?.mastodon) {
    social.push({ title: 'Mastodon', href: meta.mastodon, key: 'mastodon' });
  }
  if (meta?.discord) {
    social.push({ title: 'Discord', href: meta.discord, key: 'discord' });
  }
  if (meta?.youtube) {
    social.push({ title: 'YouTube', href: meta.youtube, key: 'youtube' });
  }
  if (meta?.linkedin) {
    social.push({ title: 'LinkedIn', href: meta.linkedin, key: 'linkedin' });
  }
  if (meta?.facebook) {
    social.push({ title: 'Facebook', href: meta.facebook, key: 'facebook' });
  }
  if (meta?.instagram) {
    social.push({ title: 'Instagram', href: meta.instagram, key: 'instagram' });
  }
  if (meta?.tiktok) {
    social.push({ title: 'TikTok', href: meta.tiktok, key: 'tiktok' });
  }
  if (meta?.telegram) {
    social.push({ title: 'Telegram', href: meta.telegram, key: 'telegram' });
  }
  const supportEmail = websiteConfig.mail?.supportEmail;
  if (supportEmail) {
    const href = supportEmail.includes('<')
      ? supportEmail.replace(/^[^<]*<([^>]*)>.*$/, 'mailto:$1')
      : `mailto:${supportEmail}`;
    social.push({ title: 'Email', href, key: 'email' });
  }
  return social;
}
