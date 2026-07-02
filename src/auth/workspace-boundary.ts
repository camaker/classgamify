import { m } from '@/locale/paraglide/messages';

export const AUTH_WORKSPACE_BOUNDARY_ITEM_IDS = [
  'account-access',
  'activity-library',
  'assignment-links',
  'student-results',
  'source-materials',
] as const;

export type AuthWorkspaceBoundaryItemId =
  (typeof AUTH_WORKSPACE_BOUNDARY_ITEM_IDS)[number];

export type AuthWorkspaceBoundaryItemView = {
  description: string;
  id: AuthWorkspaceBoundaryItemId;
  label: string;
};

export type AuthWorkspaceBoundaryView = {
  description: string;
  items: AuthWorkspaceBoundaryItemView[];
  title: string;
};

export function buildAuthWorkspaceBoundaryView(): AuthWorkspaceBoundaryView {
  return {
    description: m.auth_workspace_boundary_description(),
    items: [
      {
        description:
          m.auth_workspace_boundary_item_account_access_description(),
        id: 'account-access',
        label: m.auth_workspace_boundary_item_account_access_label(),
      },
      {
        description:
          m.auth_workspace_boundary_item_activity_library_description(),
        id: 'activity-library',
        label: m.auth_workspace_boundary_item_activity_library_label(),
      },
      {
        description:
          m.auth_workspace_boundary_item_assignment_links_description(),
        id: 'assignment-links',
        label: m.auth_workspace_boundary_item_assignment_links_label(),
      },
      {
        description:
          m.auth_workspace_boundary_item_student_results_description(),
        id: 'student-results',
        label: m.auth_workspace_boundary_item_student_results_label(),
      },
      {
        description:
          m.auth_workspace_boundary_item_source_materials_description(),
        id: 'source-materials',
        label: m.auth_workspace_boundary_item_source_materials_label(),
      },
    ],
    title: m.auth_workspace_boundary_title(),
  };
}
