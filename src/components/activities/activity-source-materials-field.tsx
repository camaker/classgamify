import {
  addActivitySourceMaterialPickerItem,
  buildActivitySourceMaterialPickerHandoffView,
  buildActivitySourceMaterialPickerView,
  removeActivitySourceMaterialPickerItem,
  type ActivitySourceMaterialPickerHandoffView,
  type ActivitySourceMaterialPickerItemView,
  type ActivitySourceMaterialPickerStatus,
  type ActivitySourceMaterialPickerView,
} from '@/activities/material-summary';
import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import type { ActivityMaterialReference } from '@/activities/types';
import { ActivitySourceMaterialsSummary } from '@/components/activities/activity-source-materials-summary';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { useUserFileMaterials } from '@/hooks/use-user-files';
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
import { useId, useMemo, type ReactNode } from 'react';

type ActivitySourceMaterialsFieldProps = {
  attachedSummaryActionSlot?: ReactNode;
  canLoadFiles: boolean;
  onChange: (value: ActivityMaterialReference[]) => void;
  value: unknown;
};

export function ActivitySourceMaterialsField({
  attachedSummaryActionSlot,
  canLoadFiles,
  onChange,
  value,
}: ActivitySourceMaterialsFieldProps) {
  const selectedMaterials = useMemo(
    () => normalizeActivityMaterialReferences(value),
    [value]
  );
  const { data, isError, isLoading } = useUserFileMaterials(
    0,
    USER_FILE_MATERIAL_PICKER_PAGE_SIZE,
    { enabled: canLoadFiles }
  );
  const pickerView = useMemo(
    () =>
      buildActivitySourceMaterialPickerView({
        availableFiles: data?.items ?? [],
        canLoadFiles,
        isError,
        isLoading,
        selectedMaterials,
      }),
    [canLoadFiles, data?.items, isError, isLoading, selectedMaterials]
  );
  const handoffView = useMemo(
    () => buildActivitySourceMaterialPickerHandoffView(pickerView),
    [pickerView]
  );

  function addMaterial(itemView: ActivitySourceMaterialPickerItemView) {
    onChange(
      addActivitySourceMaterialPickerItem({
        current: selectedMaterials,
        material: itemView.material,
      })
    );
  }

  function removeMaterial(fileId: string) {
    onChange(
      removeActivitySourceMaterialPickerItem({
        current: selectedMaterials,
        fileId,
      })
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
        <ActivitySourceMaterialCountBadge countLabel={pickerView.countLabel} />
      </div>

      <div className="mt-4 grid gap-4">
        <ActivitySourceMaterialPickerHandoff handoffView={handoffView} />
        <ActivitySourceMaterialAttachedSection
          actionSlot={attachedSummaryActionSlot}
          pickerView={pickerView}
          onRemove={removeMaterial}
        />
        <ActivitySourceMaterialAvailableSection
          pickerView={pickerView}
          onAdd={addMaterial}
        />
      </div>
    </div>
  );
}

function ActivitySourceMaterialPickerHandoff({
  handoffView,
}: {
  handoffView: ActivitySourceMaterialPickerHandoffView;
}) {
  const titleId = 'activity-source-material-picker-handoff-title';
  const descriptionId = 'activity-source-material-picker-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="activity-source-material-picker"
    >
      <h4 id={titleId}>{handoffView.title}</h4>
      <p id={descriptionId}>{handoffView.description}</p>
      <dl>
        {handoffView.itemViews.map((itemView) => (
          <div data-handoff-item={itemView.id} key={itemView.id}>
            <dt>{itemView.label}</dt>
            <dd>
              <output aria-label={itemView.ariaLabel}>{itemView.value}</output>
              <span>{itemView.description}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ActivitySourceMaterialCountBadge({
  countLabel,
}: {
  countLabel: string;
}) {
  return (
    <Badge variant="secondary" className="w-fit rounded-md">
      {countLabel}
    </Badge>
  );
}

function ActivitySourceMaterialAttachedSection({
  actionSlot,
  onRemove,
  pickerView,
}: {
  actionSlot?: ReactNode;
  onRemove: (fileId: string) => void;
  pickerView: ActivitySourceMaterialPickerView;
}) {
  return (
    <section className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-medium text-sm">
          {m.activity_form_source_materials_attached_title()}
        </h4>
        <span className="text-muted-foreground text-xs">
          {pickerView.limitLabel}
        </span>
      </div>
      {pickerView.hasAttachedItems ? (
        <>
          <ActivitySourceMaterialsSummary
            actionSlot={actionSlot}
            summary={pickerView.attachedSummary}
          />
          <ActivitySourceMaterialReferenceGrid>
            {pickerView.attachedItems.map((itemView) => (
              <MaterialReferenceRow
                key={itemView.material.fileId}
                itemView={itemView}
                action={
                  <ActivitySourceMaterialRemoveButton
                    itemView={itemView}
                    onClick={() => onRemove(itemView.material.fileId)}
                  />
                }
              />
            ))}
          </ActivitySourceMaterialReferenceGrid>
        </>
      ) : (
        <ActivitySourceMaterialEmptyAttachedMessage />
      )}
    </section>
  );
}

function ActivitySourceMaterialAvailableSection({
  onAdd,
  pickerView,
}: {
  onAdd: (itemView: ActivitySourceMaterialPickerItemView) => void;
  pickerView: ActivitySourceMaterialPickerView;
}) {
  return (
    <section className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-medium text-sm">
          {m.activity_form_source_materials_available_title()}
        </h4>
        <ActivitySourceMaterialUploadActionLink />
      </div>
      <ActivitySourceMaterialPickerStatusPanel
        message={pickerView.statusMessage}
        status={pickerView.status}
      />
      {pickerView.status === 'available' ? (
        <ActivitySourceMaterialReferenceGrid>
          {pickerView.availableItems.map((itemView) => (
            <MaterialReferenceRow
              key={itemView.material.fileId}
              itemView={itemView}
              selected={itemView.selected}
              action={
                <ActivitySourceMaterialAttachButton
                  itemView={itemView}
                  onClick={() => onAdd(itemView)}
                />
              }
            />
          ))}
        </ActivitySourceMaterialReferenceGrid>
      ) : null}
    </section>
  );
}

function ActivitySourceMaterialUploadActionLink() {
  return (
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
  );
}

function ActivitySourceMaterialPickerStatusPanel({
  message,
  status,
}: {
  message?: string;
  status: ActivitySourceMaterialPickerStatus;
}) {
  if (status === 'available' || !message) return null;

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-background p-3 text-muted-foreground text-sm">
        <IconLoader2 className="size-4 animate-spin" />
        {message}
      </div>
    );
  }

  return (
    <p
      className={cn(
        'rounded-lg border p-3 text-sm',
        status === 'error'
          ? 'border-destructive/30 bg-destructive/5 text-destructive'
          : 'border-dashed bg-background text-muted-foreground'
      )}
    >
      {message}
    </p>
  );
}

function ActivitySourceMaterialReferenceGrid({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="grid gap-2 md:grid-cols-2">{children}</div>;
}

function ActivitySourceMaterialEmptyAttachedMessage() {
  return (
    <p className="rounded-lg border border-dashed bg-background p-3 text-muted-foreground text-sm">
      {m.activity_form_source_materials_empty_attached()}
    </p>
  );
}

function MaterialReferenceRow({
  action,
  itemView,
  selected = false,
}: {
  action: ReactNode;
  itemView: ActivitySourceMaterialPickerItemView;
  selected?: boolean;
}) {
  const descriptionId = useId();

  return (
    <fieldset
      aria-describedby={descriptionId}
      aria-label={itemView.ariaLabel}
      className={cn(
        'flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-background p-3',
        selected && 'border-primary/30 bg-primary/5'
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <MaterialKindIcon kind={itemView.material.kind} />
        <span className="min-w-0">
          <span className="block truncate font-medium text-sm">
            {itemView.material.originalName}
          </span>
          <span className="block truncate text-muted-foreground text-xs">
            {itemView.meta}
          </span>
          <span id={descriptionId} className="sr-only">
            {itemView.description}
          </span>
        </span>
      </div>
      <div className="shrink-0">{action}</div>
    </fieldset>
  );
}

function ActivitySourceMaterialRemoveButton({
  itemView,
  onClick,
}: {
  itemView: ActivitySourceMaterialPickerItemView;
  onClick: () => void;
}) {
  const descriptionId = useId();

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-describedby={descriptionId}
        aria-label={itemView.removeLabel}
        onClick={onClick}
      >
        <IconX className="size-4" />
        {m.activity_form_source_materials_remove()}
      </Button>
      <span id={descriptionId} className="sr-only">
        {itemView.removeDescription}
      </span>
    </>
  );
}

function ActivitySourceMaterialAttachButton({
  itemView,
  onClick,
}: {
  itemView: ActivitySourceMaterialPickerItemView;
  onClick: () => void;
}) {
  const descriptionId = useId();

  return (
    <>
      <Button
        type="button"
        variant={itemView.selected ? 'secondary' : 'outline'}
        size="sm"
        className={cn(!itemView.selected && 'bg-background')}
        disabled={itemView.disabled}
        aria-describedby={descriptionId}
        aria-label={itemView.attachLabel}
        onClick={onClick}
      >
        <IconPlus className="size-4" />
        {itemView.actionLabel}
      </Button>
      <span id={descriptionId} className="sr-only">
        {itemView.attachDescription}
      </span>
    </>
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
