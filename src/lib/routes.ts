import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import { buildAssignmentSharePath } from '@/assignments/share-link';

const STARTER_PLAY_PATH = buildAssignmentSharePath(
  STARTER_FOOD_ASSIGNMENT_SHARE_ID
);

export const Routes = {
  Root: '/',

  // Marketing routes
  Templates: '/templates',
  Create: '/create',
  Worksheets: '/worksheets',
  StudentPreview: STARTER_PLAY_PATH,
  Play: '/play/$shareId',
  Resources: '/blog',
  DashboardActivities: '/dashboard/activities',
  DashboardActivityEdit: '/dashboard/activities/$activityId',
  DashboardAssignments: '/dashboard/assignments',
  DashboardAssignmentResults: '/dashboard/assignments/$assignmentId',
  PrintAssignmentWorksheet: '/print/assignments/$assignmentId',
  Features: '/#features',
  Faqs: '/#faqs',
  Pricing: '/pricing',
  Teachers: '/teachers',
  Blog: '/blog',
  Roadmap: '/roadmap',
  Contact: '/contact',
  ContactClassroom: '/contact?subject=classroom',

  // Auth routes
  Auth: '/auth',
  Login: '/auth/login',
  Register: '/auth/register',
  AuthError: '/auth/error',
  ForgotPassword: '/auth/forgot-password',
  ResetPassword: '/auth/reset-password',

  // Legal routes
  TermsOfService: '/terms',
  PrivacyPolicy: '/privacy',
  CookiePolicy: '/cookie',

  // Payment routes
  Payment: '/settings/payment',

  // Dashboard routes
  Dashboard: '/dashboard',

  // Settings routes
  Settings: '/settings',
  SettingsProfile: '/settings/profile',
  SettingsBilling: '/settings/billing',
  SettingsSecurity: '/settings/security',
  SettingsFiles: '/settings/files',
  SettingsNotifications: '/settings/notifications',

  // Admin routes
  Admin: '/admin',
  AdminUsers: '/admin/users',
} as const;

/** Default login redirect route */
export const DEFAULT_LOGIN_REDIRECT = Routes.Dashboard;
