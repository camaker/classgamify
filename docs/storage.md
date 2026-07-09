# Storage Module

The storage module provides file upload, download, listing, and delete support
using **Cloudflare R2** via the Worker bucket binding. No environment variables
are required for storage (see [Env](./env.md) for project env overview). No S3
SDK or third-party storage library is used; the provider talks directly to the
[Cloudflare R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/).

In ClassGamify, this module is the foundation for teacher-managed classroom
materials: future activity audio, worksheet images, worksheet documents,
spreadsheets, and similar files. Avatar upload is still supported through the
same server function, but it is not the only storage consumer.

For the production configuration boundary around R2 bindings, source-material
privacy, and student payload safety, see [Configuration](./configuration.md).

## Enabling Storage

1. **Create the R2 bucket** (once per environment):

   ```bash
   npx wrangler r2 bucket create <BUCKET_NAME>
   ```

   Use the same name as `bucket_name` in `wrangler.jsonc` (e.g. `classgamify`).

2. **Configure the bucket in `wrangler.jsonc`**:

   ```jsonc
   "r2_buckets": [
     {
      "bucket_name": "classgamify",
      "binding": "BUCKET"
     }
   ]
   ```

   The Worker receives the bucket as `env.BUCKET`. No extra env vars are required for upload/serve.

3. **Enable storage in website config** (`src/config/website.ts`):

   ```ts
   storage: {
     enable: true,
     provider: 'r2',
     maxFileSize: 10 * 1024 * 1024, // optional, default 10MB
     allowedTypes: ['.pdf', '.png', '.jpg', '.mp3'], // optional
     userFilesFolder: 'userfiles',
   },
   ```

   After this, the upload server function, settings file manager, and avatar
   card are active. Returned file URLs use the same-origin proxy
   `/api/storage/file?key=...`.

## Directory Structure

```
src/storage/
├── content-disposition.ts # Safe attachment filename headers
├── constants.ts       # Default size, folder, and allowed-type settings
├── file-access.ts     # Same-origin file access and response header policy
├── file-materials.ts  # Classroom material kind classification
├── file-summary.ts    # Classroom material summary metrics
├── index.ts           # getStorageProvider, uploadFile, deleteFile, getFile, …
├── types.ts           # R2BucketInterface, UploadFileResult, errors
├── upload-readiness.ts # Upload validation, R2 key, and same-origin URL plan
├── utils.ts           # Folder and public-folder helpers
└── provider/
    └── r2.ts          # R2Provider (upload, delete, download, list, …)

src/activities/
└── material-references.ts # Activity source-material reference boundary
```

## Configuration

- **websiteConfig.storage** (`src/config/website.ts`)
  - `enable`: Whether storage is enabled. When false, the upload API, file
    manager, and avatar upload card are disabled.
  - `provider`: `'r2'`.
  - `maxFileSize`: Max file size in bytes. The current default is 10MB.
  - `allowedTypes`: Allowed file extensions (e.g. `['.jpg', '.jpeg', '.png', '.webp']`).
  - `userFilesFolder`: Parent folder for per-user files (e.g. `'userfiles'`);
    used by Settings → Files and upload API.

- **wrangler.jsonc**
  - `r2_buckets`: Bind the R2 bucket with `binding: "BUCKET"` (and
    `bucket_name`). `R2Provider` in `provider/r2.ts` reads `env.BUCKET` and is
    exported from `@/storage`.

Files are always served via the same-origin route `/api/storage/file?key=...`.

## Core API

- **uploadFile(file, filename, contentType, folder?)** (server, in `@/storage`)
  - Uploads to R2; returns `Promise<{ url, key, metadata? }>`. Used by the
    `uploadUserFile` server function.

- **buildStorageUploadReadinessPlan** (shared helper, in
  `@/storage/upload-readiness`): Builds the 20-slice classroom material upload
  contract for validation, content-type and extension normalization, filename
  and folder sanitization, owner/public persistence, R2 key planning,
  same-origin proxy URLs, provider helper reuse, and privacy guards around file
  bytes, original filenames, storage keys, and student payloads.

- **resolveStorageFileAccessDecision** and
  **buildStorageFileResponseHeaders** (shared helpers, in
  `@/storage/file-access`): Build the 30-slice same-origin storage file access
  contract for `/api/storage/file?key=...`, including key validation, public
  folder access, private `userFiles` owner checks, storage-missing fallback,
  safe inline content types, attachment download headers, cache headers,
  `nosniff`, and privacy guards around file bytes, storage keys, permission
  metadata, and student payloads.

- **deleteFile(key)** (server)
  - Deletes the object from R2. Used by `deleteUserFile` server function (e.g.
    Settings → Files).

- **uploadUserFile** (server function, in `@/api/user-files`): Accepts
  `FormData` (file, optional folder, isPublic, description). Requires session
  via `authApiMiddleware`. Validates file size, extension, and content type;
  uploads to R2; inserts private user-scoped uploads into the `userFiles`
  table; and returns `{ url, key }`. Used by `useUploadUserFile()` and
  `useUploadUserAvatar()`.

- **formatUserFileUploadError** (server/domain helper, in
  `@/api/user-file-errors`): Converts structured storage error codes into
  Paraglide messages before errors reach UI toasts.

- **resolveUserFileMaterialKind** (shared helper, in
  `@/storage/file-materials`): Classifies saved files as audio, worksheet image,
  worksheet document, spreadsheet, video, archive, data file, or file using
  `contentType` plus filename-extension fallback.

- **buildUserFileMaterialSummary** (shared helper, in
  `@/storage/file-summary`): Builds reusable classroom-material totals for the
  Files settings page and future activity/AI material pickers, including total
  files, bytes, access mix, audio count, and worksheet-material count.

- **listUserFileMaterials** (server function, in `@/api/user-files`): Returns
  the compact owner-scoped material fields needed by the activity source-material
  picker: `id`, `filename`, `originalName`, `contentType`, and `size`. It does
  not return `r2Key`, access flags, or storage permission metadata to the
  activity editor.

- **buildActivityMaterialReferenceFromUserFile** and
  **normalizeActivityMaterialReferences** (shared helpers, in
  `@/activities/material-references`): Convert owner-scoped `userFiles` rows
  into compact `ActivityContent.sourceMaterials` references. These references
  keep activity drafts linked to teacher audio, worksheet images, worksheet
  documents, or spreadsheets for future AI extraction and editing workflows
  without duplicating R2 keys or file-permission data inside activity JSON. The
  activity source-material reference boundary is a 30-slice contract for safe
  file ids, safe filename basenames, content-type normalization, material-kind
  fallback, size normalization, duplicate collapse, the 12-reference limit,
  compact JSON shape, storage-key omission, and student-payload privacy.

- **buildAttachmentContentDisposition** (shared helper, in
  `@/storage/content-disposition`): Builds safe attachment headers that preserve
  teacher-uploaded original filenames, including Chinese names through
  `filename*`, while keeping an ASCII fallback.

- **useUploadUserAvatar()** (client, in `@/hooks/use-user-files`): Mutation
  that uploads a public file with `folder: 'avatars'` via `uploadUserFile`;
  returns `{ url, key }`. Used by the avatar upload card.

- **useUploadUserFile()** (client, in `@/hooks/use-user-files`): Mutation that
  uploads a user file via `uploadUserFile`; used by Settings → Files.

## API routes

- **GET /api/storage/file?key=...**
  - Streams the object from R2. Private `userFiles` entries require session and
    ownership check. Public shared folders such as `avatars` remain accessible
    by key. Access decisions and response headers are delegated to
    `src/storage/file-access.ts` so the same-origin proxy keeps public cache,
    private no-store, attachment filename, and `nosniff` behavior aligned with
    the source-material privacy contract.

Upload is implemented as a **server function** (`uploadUserFile` in `src/api/user-files.ts`), not an API route.

## Consumers

- **Settings → Profile** (`UpdateAvatarCard`): When `websiteConfig.storage.enable` is true, the user can upload an avatar; the client uses `useUploadUserAvatar()` (which calls `uploadUserFile`) then updates `user.image` with the returned URL.
- **Settings → Files**: List/delete/upload classroom materials via server
  functions in `src/api/user-files.ts` (`listUserFiles`, `deleteUserFile`,
  `uploadUserFile`). Files are stored under `userFilesFolder`; the table shows a
  teacher-facing material type while preserving the raw content type for
  troubleshooting.
- **Activity content**: `ActivityContent.sourceMaterials` stores compact
  references to teacher-owned `userFiles` records. The activity editor loads
  selectable files through `listUserFileMaterials`, so it can attach classroom
  materials without receiving R2 keys. Student assignment payloads still expose
  only sanitized runtime prompts and choices; they do not expose source-material
  references or storage keys.

## Notes

- The R2 bucket is provided by the Worker binding only; no S3-style credentials or endpoint are used.
- Storage validation errors use stable codes in `src/storage/types.ts`; UI copy
  comes from Paraglide messages at the API boundary.
- For avatar use, the returned URL is stored in `user.image` (Better Auth).
  User-scoped classroom files are tracked in the `userFiles` table so teachers
  can list, delete, and review uploaded materials.
