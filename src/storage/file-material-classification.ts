import { m } from '@/locale/paraglide/messages';
import type { Locale } from '@/locale/paraglide/runtime';
import {
  classifyUserFileMaterial,
  type UserFileMaterialClassificationBasis,
  type UserFileMaterialKind,
} from '@/storage/file-materials';
import {
  formatUserFileMaterialClassificationBasis,
  formatUserFileMaterialKind,
} from '@/storage/file-material-labels';

export type UserFileMaterialClassificationInput = {
  contentType?: string | null;
  filename?: string | null;
  originalName?: string | null;
};

export type UserFileMaterialClassificationView = {
  basis: UserFileMaterialClassificationBasis;
  basisLabel: string;
  contentType?: string;
  extension?: string;
  isAudioMaterial: boolean;
  isWorksheetMaterial: boolean;
  kind: UserFileMaterialKind;
  label: string;
  secondaryDetail: string;
  secondaryLabel: string;
};

export function buildUserFileMaterialClassificationView(
  file: UserFileMaterialClassificationInput,
  options?: { locale?: Locale }
): UserFileMaterialClassificationView {
  const classification = classifyUserFileMaterial(file);
  const secondaryDetail = getUserFileMaterialSecondaryDetail(classification);

  return {
    basis: classification.basis,
    basisLabel: formatUserFileMaterialClassificationBasis(
      classification.basis,
      options
    ),
    contentType: classification.contentType,
    extension: classification.extension,
    isAudioMaterial: classification.kind === 'audio',
    isWorksheetMaterial:
      classification.kind === 'worksheet-document' ||
      classification.kind === 'worksheet-image',
    kind: classification.kind,
    label: formatUserFileMaterialKind(classification.kind, options),
    secondaryDetail,
    secondaryLabel: classification.contentType
      ? m.settings_files_material_secondary_content_type({}, options)
      : m.settings_files_material_secondary_extension({}, options),
  };
}

function getUserFileMaterialSecondaryDetail(
  classification: ReturnType<typeof classifyUserFileMaterial>
) {
  if (classification.contentType) {
    return classification.contentType;
  }

  if (classification.extension) {
    return `.${classification.extension}`;
  }

  return m.common_empty_value();
}
