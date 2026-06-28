import { m } from '@/locale/paraglide/messages';
import type { Locale } from '@/locale/paraglide/runtime';
import type { UserFileMaterialKind } from '@/storage/file-materials';

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
