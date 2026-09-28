import * as React from 'react'
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext.name) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id, hasDescription, hasMessage } = itemContext

  return {
    id,
    hasDescription,
    hasMessage,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
  hasDescription?: boolean
  hasMessage?: boolean
  setHasDescription?: (value: boolean) => void
  setHasMessage?: (value: boolean) => void
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
)

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId()
  const [hasDescription, setHasDescription] = React.useState(false)
  const [hasMessage, setHasMessage] = React.useState(false)
  const value = React.useMemo(
    () => ({
      id,
      hasDescription,
      hasMessage,
      setHasDescription,
      setHasMessage,
    }),
    [id, hasDescription, hasMessage],
  )

  return (
    <FormItemContext.Provider value={value}>
      <div
        data-slot="form-item"
        className={cn('grid gap-2', className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({
  children,
}: { children?: React.ReactNode }) {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId,
    hasDescription,
    hasMessage,
  } = useFormField()

  // Only reference ids that are actually rendered in the DOM.
  const describedBy = [
    hasDescription && formDescriptionId,
    hasMessage && formMessageId,
  ]
    .filter(Boolean)
    .join(' ')

  const child = React.Children.only(children) as React.ReactElement
  return React.cloneElement(child, {
    id: formItemId,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': !!error,
  })
}

function FormDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField()
  const { setHasDescription } = React.useContext(FormItemContext)

  React.useEffect(() => {
    setHasDescription?.(true)
    return () => setHasDescription?.(false)
  }, [setHasDescription])

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function FormMessage({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? '') : props.children
  const { setHasMessage } = React.useContext(FormItemContext)
  const isRendered = !!body

  React.useEffect(() => {
    setHasMessage?.(isRendered)
    return () => setHasMessage?.(false)
  }, [isRendered, setHasMessage])

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn('text-destructive text-sm', className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
