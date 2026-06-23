import { getUserFileExtension } from '@/storage/file-materials';

const FALLBACK_DOWNLOAD_FILENAME = 'classgamify-file';

function getLastPathSegment(filename: string): string {
  return filename.split(/[\\/]/).at(-1) ?? filename;
}

function normalizeDownloadFilename(filename?: string | null): string {
  const name = getLastPathSegment(filename ?? '')
    .replace(/[\r\n"]/g, '')
    .trim();

  return name === '' ? FALLBACK_DOWNLOAD_FILENAME : name;
}

function buildAsciiFallbackFilename(filename: string): string {
  const extension = getUserFileExtension({ originalName: filename });
  const ascii = filename
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[\\/%?*:|<>;]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  const asciiWithoutExtension =
    extension && ascii.toLowerCase().endsWith(`.${extension}`)
      ? ascii.slice(0, -(extension.length + 1)).trim()
      : ascii;

  if (/[A-Za-z0-9]/.test(asciiWithoutExtension)) {
    return ascii;
  }

  return extension
    ? `${FALLBACK_DOWNLOAD_FILENAME}.${extension}`
    : FALLBACK_DOWNLOAD_FILENAME;
}

function encodeRfc5987Value(value: string): string {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

export function buildAttachmentContentDisposition(
  filename?: string | null
): string {
  const normalizedFilename = normalizeDownloadFilename(filename);
  const asciiFilename = buildAsciiFallbackFilename(normalizedFilename);
  const encodedFilename = encodeRfc5987Value(normalizedFilename);

  return [
    'attachment',
    `filename="${asciiFilename}"`,
    `filename*=UTF-8''${encodedFilename}`,
  ].join('; ');
}
