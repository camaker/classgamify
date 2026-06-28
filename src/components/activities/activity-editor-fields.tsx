import type {
  buildActivityEditorSelectOptions,
  buildActivityEditorTemplateView,
} from '@/activities/editor';
import type { CreateActivityInput } from '@/activities/validation';
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
import type { ReactNode } from 'react';
import type { Control } from 'react-hook-form';

type ActivityEditorTemplateView = ReturnType<
  typeof buildActivityEditorTemplateView
>;

type ActivityEditorSelectOptionsView = ReturnType<
  typeof buildActivityEditorSelectOptions
>;

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
              <Textarea {...field} rows={2} />
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
              <Textarea {...field} rows={2} />
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
}: ActivityEditorFieldsProps) {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          control={control}
          name="vocabularyText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{m.activity_form_field_vocabulary()}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
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
        <FormField
          control={control}
          name="questionsText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{m.activity_form_field_questions()}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder={m.activity_form_questions_placeholder()}
                />
              </FormControl>
              <FormDescription>
                {m.activity_form_questions_description()}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          control={control}
          name="pairsText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{m.activity_form_field_pairs()}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder={m.activity_form_pairs_placeholder()}
                />
              </FormControl>
              <FormDescription>
                {m.activity_form_pairs_description()}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="groupsText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{m.activity_form_field_groups()}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder={m.activity_form_groups_placeholder()}
                />
              </FormControl>
              <FormDescription>
                {m.activity_form_groups_description()}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          control={control}
          name="sourceSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{m.activity_form_field_source_summary()}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
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
                <Textarea {...field} rows={3} />
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
