import { m } from '@/locale/paraglide/messages';
import type { Locale } from '@/locale/paraglide/runtime';
import type {
  UserFileMaterialClassificationBasis,
  UserFileMaterialKind,
} from '@/storage/file-materials';

type UserFileMaterialKindFormatOptions = {
  locale?: Locale;
};

export function formatUserFileMaterialKind(
  kind: UserFileMaterialKind,
  options?: UserFileMaterialKindFormatOptions
): string {
  switch (kind) {
    case 'archive':
      return m.settings_files_material_type_archive({}, options);
    case 'audio':
      return m.settings_files_material_type_audio({}, options);
    case 'data':
      return m.settings_files_material_type_data({}, options);
    case 'spreadsheet':
      return m.settings_files_material_type_spreadsheet({}, options);
    case 'video':
      return m.settings_files_material_type_video({}, options);
    case 'worksheet-document':
      return m.settings_files_material_type_worksheet_document({}, options);
    case 'worksheet-image':
      return m.settings_files_material_type_worksheet_image({}, options);
    default:
      return m.settings_files_material_type_file({}, options);
  }
}

export function formatUserFileMaterialClassificationBasis(
  basis: UserFileMaterialClassificationBasis,
  options?: UserFileMaterialKindFormatOptions
): string {
  switch (basis) {
    case 'content-type':
      return m.settings_files_material_basis_content_type({}, options);
    case 'extension':
      return m.settings_files_material_basis_extension({}, options);
    case 'fallback':
      return m.settings_files_material_basis_fallback({}, options);
  }

  const exhaustiveBasis: never = basis;
  return exhaustiveBasis;
}
