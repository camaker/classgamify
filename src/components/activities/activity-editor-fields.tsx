import type {
  ActivityEditorSelectOptionsView,
  ActivityEditorTemplateView,
} from '@/activities/editor';
import type { ActivityTemplateContentRequirement } from '@/activities/types';
import type { CreateActivityInput } from '@/activities/validation';
import { ActivityRowListEditor } from '@/components/activities/activity-row-list-editor';
import { ActivitySourceMaterialsField } from '@/components/activities/activity-source-materials-field';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { m } from '@/locale/paraglide/messages';
import { IconPaperclip } from '@tabler/icons-react';
import { Fragment, type ReactNode } from 'react';
import type { Control } from 'react-hook-form';

type ActivityEditorFieldsProps = {
  control: Control<CreateActivityInput>;
};

export function ActivityEditorPrimaryFields({
  control,
  templateView,
}: ActivityEditorFieldsProps & {
  templateView: ActivityEditorTemplateView;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{m.activity_form_field_title()}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="templateType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{m.activity_form_field_primary_template()}</FormLabel>
            <FormControl>
              <NativeSelect {...field} className="w-full">
                {templateView.templateOptions.map((item) => (
                  <NativeSelectOption key={item.type} value={item.type}>
                    {item.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </FormControl>
            <FormDescription>{templateView.template.bestFor}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function ActivityEditorDetailsFields({
  control,
  selectOptionsView,
}: ActivityEditorFieldsProps & {
  selectOptionsView: ActivityEditorSelectOptionsView;
}) {
  return (
    <>
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{m.activity_form_field_description()}</FormLabel>
            <FormControl>
              <Textarea {...field} className="max-h-40" rows={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <FormField
          control={control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{m.activity_form_field_subject()}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="gradeBand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{m.activity_form_field_grade_band()}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{m.activity_form_field_difficulty()}</FormLabel>
              <FormControl>
                <NativeSelect {...field} className="w-full">
                  {selectOptionsView.difficultyOptions.map((option) => (
                    <NativeSelectOption key={option.value} value={option.value}>
                      {option.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{m.activity_form_field_visibility()}</FormLabel>
              <FormControl>
                <NativeSelect {...field} className="w-full">
                  {selectOptionsView.visibilityOptions.map((option) => (
                    <NativeSelectOption key={option.value} value={option.value}>
                      {option.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="learningGoal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{m.activity_form_field_learning_goal()}</FormLabel>
            <FormControl>
              <Textarea {...field} className="max-h-40" rows={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function ActivityEditorStructuredContentFields({
  control,
  requirements,
}: ActivityEditorFieldsProps & {
  requirements: readonly ActivityTemplateContentRequirement[];
}) {
  const primaryContent = CONTENT_REQUIREMENT_ORDER.filter(
    (kind: StructuredContentKind) => requirements.includes(kind)
  );
  const otherContent = CONTENT_REQUIREMENT_ORDER.filter(
    (kind: StructuredContentKind) => !primaryContent.includes(kind)
  );
  const contentFields: Record<StructuredContentKind, ReactNode> = {
    questions: (
      <FormField
        control={control}
        name="questionsText"
        render={({ field }) => (
          <FormItem>
            <p className="font-semibold text-base">
              {m.activity_form_field_questions()}
            </p>
            <ActivityRowListEditor
              addLabel={m.activity_form_rows_add_question()}
              columns={[
                {
                  key: 'prompt',
                  label: m.activity_form_rows_prompt(),
                  wide: true,
                },
                { key: 'answer', label: m.activity_form_rows_answer() },
                {
                  key: 'options',
                  label: m.activity_form_rows_options(),
                  placeholder: m.activity_form_rows_options_placeholder(),
                },
                {
                  key: 'explanation',
                  label: m.activity_form_rows_explanation(),
                  wide: true,
                },
              ]}
              rowLabel={(number) =>
                m.activity_form_rows_question_label({ number })
              }
              textareaProps={{
                name: field.name,
                onBlur: field.onBlur,
                placeholder: m.activity_form_questions_placeholder(),
                ref: field.ref,
              }}
              value={field.value ?? ''}
              onChange={field.onChange}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    pairs: (
      <FormField
        control={control}
        name="pairsText"
        render={({ field }) => (
          <FormItem>
            <p className="font-semibold text-base">
              {m.activity_form_field_pairs()}
            </p>
            <p className="text-muted-foreground text-sm">
              {m.activity_form_pairs_description()}
            </p>
            <ActivityRowListEditor
              addLabel={m.activity_form_rows_add_pair()}
              columns={[
                { key: 'left', label: m.activity_form_rows_left() },
                { key: 'right', label: m.activity_form_rows_right() },
              ]}
              rowLabel={(number) => m.activity_form_rows_pair_label({ number })}
              textareaProps={{
                name: field.name,
                onBlur: field.onBlur,
                placeholder: m.activity_form_pairs_placeholder(),
                ref: field.ref,
              }}
              value={field.value ?? ''}
              onChange={field.onChange}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    groups: (
      <FormField
        control={control}
        name="groupsText"
        render={({ field }) => (
          <FormItem>
            <p className="font-semibold text-base">
              {m.activity_form_field_groups()}
            </p>
            <p className="text-muted-foreground text-sm">
              {m.activity_form_groups_description()}
            </p>
            <ActivityRowListEditor
              addLabel={m.activity_form_rows_add_group()}
              columns={[
                { key: 'label', label: m.activity_form_rows_group_name() },
                {
                  key: 'items',
                  label: m.activity_form_rows_group_items(),
                  placeholder: m.activity_form_rows_items_placeholder(),
                },
              ]}
              rowLabel={(number) =>
                m.activity_form_rows_group_label({ number })
              }
              textareaProps={{
                name: field.name,
                onBlur: field.onBlur,
                placeholder: m.activity_form_groups_placeholder(),
                ref: field.ref,
              }}
              value={field.value ?? ''}
              onChange={field.onChange}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    ),
  };

  return (
    <>
      {primaryContent.map((kind: StructuredContentKind) => (
        <Fragment key={kind}>{contentFields[kind]}</Fragment>
      ))}
      {otherContent.length > 0 ? (
        <details className="rounded-lg border px-4 py-3">
          <summary className="cursor-pointer font-medium text-sm">
            {m.activity_form_other_content_summary()}
          </summary>
          <div className="mt-4 grid gap-6">
            {otherContent.map((kind: StructuredContentKind) => (
              <Fragment key={kind}>{contentFields[kind]}</Fragment>
            ))}
          </div>
        </details>
      ) : null}

      <FormField
        control={control}
        name="vocabularyText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{m.activity_form_field_vocabulary()}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                className="max-h-52"
                rows={3}
                placeholder={m.activity_form_vocabulary_placeholder()}
              />
            </FormControl>
            <FormDescription>
              {m.activity_form_vocabulary_description()}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          control={control}
          name="sourceSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{m.activity_form_field_source_summary()}</FormLabel>
              <FormControl>
                <Textarea {...field} className="max-h-44" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="teacherNotesText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{m.activity_form_field_teacher_notes()}</FormLabel>
              <FormControl>
                <Textarea {...field} className="max-h-44" rows={3} />
              </FormControl>
              <FormDescription>
                {m.activity_form_teacher_notes_description()}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}

/** The structured content lists a template can play from. */
type StructuredContentKind = 'groups' | 'pairs' | 'questions';

const CONTENT_REQUIREMENT_ORDER: readonly StructuredContentKind[] = [
  'questions',
  'pairs',
  'groups',
];

export function ActivityEditorSourceMaterialsFormField({
  attachedSummaryActionSlot,
  canLoadFiles,
  control,
}: ActivityEditorFieldsProps & {
  attachedSummaryActionSlot?: ReactNode;
  canLoadFiles: boolean;
}) {
  return (
    <FormField
      control={control}
      name="sourceMaterials"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <ActivitySourceMaterialsField
              attachedSummaryActionSlot={attachedSummaryActionSlot}
              canLoadFiles={canLoadFiles}
              value={field.value}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ActivityEditorSyncSourceMaterialsAction({
  disabled,
  label,
  onClick,
}: {
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 bg-background px-2 text-xs"
      disabled={disabled}
      onClick={onClick}
    >
      <IconPaperclip className="size-3.5" />
      {label}
    </Button>
  );
}
