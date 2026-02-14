import { websiteConfig } from './config/website'

export const Routes = {
  Root: '/',
  Login: '/auth/login',
  Register: '/auth/register',
  AuthError: '/auth/error',
  ForgotPassword: '/auth/forgot-password',
  ResetPassword: '/auth/reset-password',
  TermsOfService: '/terms',
  PrivacyPolicy: '/privacy',
  Dashboard: '/dashboard',
} as const

export const DEFAULT_LOGIN_REDIRECT =
  websiteConfig.routes.defaultLoginRedirect ?? Routes.Dashboard
