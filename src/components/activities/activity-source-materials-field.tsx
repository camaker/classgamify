import {
  ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
  buildActivityMaterialReferenceFromUserFile,
  normalizeActivityMaterialReferences,
} from '@/activities/material-references';
import {
  buildActivitySourceMaterialSummaryView,
  formatActivitySourceMaterialReferenceMeta,
} from '@/activities/material-summary';
import type { ActivityMaterialReference } from '@/activities/types';
import { ActivitySourceMaterialsSummary } from '@/components/activities/activity-source-materials-summary';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { useUserFileMaterials } from '@/hooks/use-user-files';
import { formatBytes } from '@/lib/formatter';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { m } from '@/locale/paraglide/messages';
import { USER_FILE_MATERIAL_PICKER_PAGE_SIZE } from '@/storage/file-query';
import type { UserFileMaterialKind } from '@/storage/file-materials';
import {
  IconFile,
  IconFileMusic,
  IconFileSpreadsheet,
  IconFileText,
  IconFileTypeZip,
  IconLoader2,
  IconPaperclip,
  IconPhoto,
  IconPlus,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useMemo, type ReactNode } from 'react';

type ActivitySourceMaterialsFieldProps = {
  canLoadFiles: boolean;
  onChange: (value: ActivityMaterialReference[]) => void;
  value: unknown;
};

type AvailableMaterialOption = {
  material: ActivityMaterialReference;
};

export function ActivitySourceMaterialsField({
  canLoadFiles,
  onChange,
  value,
}: ActivitySourceMaterialsFieldProps) {
  const selectedMaterials = useMemo(
    () => normalizeActivityMaterialReferences(value),
    [value]
  );
  const selectedIds = useMemo(
    () => new Set(selectedMaterials.map((material) => material.fileId)),
    [selectedMaterials]
  );
  const selectedSummary = useMemo(
    () => buildActivitySourceMaterialSummaryView(selectedMaterials),
    [selectedMaterials]
  );
  const { data, isError, isLoading } = useUserFileMaterials(
    0,
    USER_FILE_MATERIAL_PICKER_PAGE_SIZE,
    { enabled: canLoadFiles }
  );
  const availableOptions = useMemo(
    () =>
      (data?.items ?? []).flatMap((file) => {
        const material = buildActivityMaterialReferenceFromUserFile(file);

        return material ? [{ material }] : [];
      }),
    [data?.items]
  );
  const isAtLimit =
    selectedMaterials.length >= ACTIVITY_SOURCE_MATERIALS_MAX_COUNT;
  const hasAvailableOptions = availableOptions.length > 0;

  function addMaterial(option: AvailableMaterialOption) {
    onChange(
      normalizeActivityMaterialReferences([
        ...selectedMaterials,
        option.material,
      ])
    );
  }

  function removeMaterial(fileId: string) {
    onChange(
      selectedMaterials.filter((material) => material.fileId !== fileId)
    );
  }

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <IconPaperclip className="size-4 text-primary" />
            <h3 className="font-semibold text-sm">
              {m.activity_form_source_materials_title()}
            </h3>
          </div>
          <p className="mt-1 text-muted-foreground text-xs leading-5">
            {m.activity_form_source_materials_description()}
          </p>
        </div>
        <Badge variant="secondary" className="w-fit rounded-md">
          {m.activity_form_source_materials_count({
            count: selectedMaterials.length,
          })}
        </Badge>
      </div>

      <div className="mt-4 grid gap-4">
        <section className="grid gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-medium text-sm">
              {m.activity_form_source_materials_attached_title()}
            </h4>
            <span className="text-muted-foreground text-xs">
              {m.activity_form_source_materials_limit({
                count: ACTIVITY_SOURCE_MATERIALS_MAX_COUNT,
              })}
            </span>
          </div>
          {selectedMaterials.length > 0 ? (
            <>
              <ActivitySourceMaterialsSummary summary={selectedSummary} />
              <div className="grid gap-2 md:grid-cols-2">
                {selectedMaterials.map((material) => (
                  <MaterialReferenceRow
                    key={material.fileId}
                    material={material}
                    action={
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={m.activity_form_source_materials_remove_label(
                          { name: material.originalName }
                        )}
                        onClick={() => removeMaterial(material.fileId)}
                      >
                        <IconX className="size-4" />
                        {m.activity_form_source_materials_remove()}
                      </Button>
                    }
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-dashed bg-background p-3 text-muted-foreground text-sm">
              {m.activity_form_source_materials_empty_attached()}
            </p>
          )}
        </section>

        <section className="grid gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-medium text-sm">
              {m.activity_form_source_materials_available_title()}
            </h4>
            <Link
              to={Routes.SettingsFiles}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'bg-background'
              )}
            >
              <IconPlus className="size-4" />
              {m.activity_form_source_materials_upload_action()}
            </Link>
          </div>

          {!canLoadFiles ? (
            <p className="rounded-lg border border-dashed bg-background p-3 text-muted-foreground text-sm">
              {m.activity_form_source_materials_sign_in_hint()}
            </p>
          ) : null}

          {canLoadFiles && isLoading ? (
            <div className="flex items-center gap-2 rounded-lg border bg-background p-3 text-muted-foreground text-sm">
              <IconLoader2 className="size-4 animate-spin" />
              {m.activity_form_source_materials_loading()}
            </div>
          ) : null}

          {canLoadFiles && isError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm">
              {m.activity_form_source_materials_load_error()}
            </p>
          ) : null}

          {canLoadFiles && !isLoading && !isError && !hasAvailableOptions ? (
            <p className="rounded-lg border border-dashed bg-background p-3 text-muted-foreground text-sm">
              {m.activity_form_source_materials_empty_available()}
            </p>
          ) : null}

          {canLoadFiles && !isLoading && !isError && hasAvailableOptions ? (
            <div className="grid gap-2 md:grid-cols-2">
              {availableOptions.map((option) => {
                const selected = selectedIds.has(option.material.fileId);
                const disabled = selected || isAtLimit;

                return (
                  <MaterialReferenceRow
                    key={option.material.fileId}
                    material={option.material}
                    selected={selected}
                    action={
                      <Button
                        type="button"
                        variant={selected ? 'secondary' : 'outline'}
                        size="sm"
                        className={cn(!selected && 'bg-background')}
                        disabled={disabled}
                        aria-label={m.activity_form_source_materials_attach_label(
                          { name: option.material.originalName }
                        )}
                        onClick={() => addMaterial(option)}
                      >
                        <IconPlus className="size-4" />
                        {selected
                          ? m.activity_form_source_materials_attached()
                          : m.activity_form_source_materials_attach()}
                      </Button>
                    }
                  />
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function MaterialReferenceRow({
  action,
  material,
  selected = false,
}: {
  action: ReactNode;
  material: ActivityMaterialReference;
  selected?: boolean;
}) {
  const meta = formatActivitySourceMaterialReferenceMeta(material, [
    typeof material.size === 'number' ? formatBytes(material.size) : undefined,
  ]);

  return (
    <div
      className={cn(
        'flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-background p-3',
        selected && 'border-primary/30 bg-primary/5'
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <MaterialKindIcon kind={material.kind} />
        <span className="min-w-0">
          <span className="block truncate font-medium text-sm">
            {material.originalName}
          </span>
          <span className="block truncate text-muted-foreground text-xs">
            {meta}
          </span>
        </span>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function MaterialKindIcon({ kind }: { kind: UserFileMaterialKind }) {
  const Icon = materialKindIcons[kind] ?? IconFile;

  return (
    <span className="rounded-md border bg-muted p-2 text-primary">
      <Icon className="size-4" />
    </span>
  );
}

const materialKindIcons = {
  archive: IconFileTypeZip,
  audio: IconFileMusic,
  data: IconFileText,
  file: IconFile,
  spreadsheet: IconFileSpreadsheet,
  video: IconVideo,
  'worksheet-document': IconFileText,
  'worksheet-image': IconPhoto,
} satisfies Record<UserFileMaterialKind, typeof IconFile>;
