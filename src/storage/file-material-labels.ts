import { m } from '@/locale/paraglide/messages';
import type { UserFileMaterialKind } from '@/storage/file-materials';

export function formatUserFileMaterialKind(kind: UserFileMaterialKind): string {
  switch (kind) {
    case 'archive':
      return m.settings_files_material_type_archive();
    case 'audio':
      return m.settings_files_material_type_audio();
    case 'data':
      return m.settings_files_material_type_data();
    case 'spreadsheet':
      return m.settings_files_material_type_spreadsheet();
    case 'video':
      return m.settings_files_material_type_video();
    case 'worksheet-document':
      return m.settings_files_material_type_worksheet_document();
    case 'worksheet-image':
      return m.settings_files_material_type_worksheet_image();
    default:
      return m.settings_files_material_type_file();
  }
}
