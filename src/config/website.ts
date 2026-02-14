/**
 * Website config for auth and routes (no i18n).
 */
export const websiteConfig = {
  routes: {
    defaultLoginRedirect: '/dashboard',
  },
  auth: {
    enableGoogleLogin: true,
    enableCredentialLogin: true,
  },
} as const
