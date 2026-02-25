import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { DefaultValues, FieldValues, FormProvider, useForm, SubmitHandler } from 'react-hook-form'
import { ZodType } from 'zod'

type FormWrapperProps<TFormValues extends FieldValues = FieldValues> = {
  defaultValues: DefaultValues<TFormValues>
  schema: ZodType<TFormValues>
  children: React.ReactNode
  onSubmit: (TFormValues) => void
}

const FormWrapper = <TFormValues extends FieldValues = FieldValues>({
  children,
  defaultValues,
  schema,
  onSubmit
}: FormWrapperProps<TFormValues>): React.JSX.Element => {
  {
    const methods = useForm({
      defaultValues,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: zodResolver(schema as any),
      mode: 'onBlur'
    })

    useEffect(() => {
      methods.reset(defaultValues)
    }, [methods, defaultValues])

    // const { getValues } = methods

    // console.log(getValues())

    const submit: SubmitHandler<TFormValues> = (data, event) => {
      event?.preventDefault()
      onSubmit(data)
    }

    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(submit)}>{children}</form>
      </FormProvider>
    )
  }
}

export default FormWrapper
