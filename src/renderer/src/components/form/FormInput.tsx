import { useFormContext } from 'react-hook-form'
import Input from '../ui/Input'
import { useEffect } from 'react'
import Alert from '../ui/Alert'

type FormInputProps = {
  name: string
  label?: string
  fieldWatch?: string
}

export default function FormInput({ name, label, fieldWatch }: FormInputProps): React.JSX.Element {
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = useFormContext()

  let fieldValue = ''
  if (fieldWatch) {
    fieldValue = watch(fieldWatch)
  }

  useEffect(() => {
    if (fieldValue) {
      setValue(name, fieldValue)
    }
  }, [name, setValue, fieldValue])

  return (
    <div className="mb-4">
      {label && (
        <label
          className={`flex mb-1 font-medium text-xs ${errors[name] ? 'text-red-500' : ''}`}
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <Input id={name} {...register(name)} />
      {errors[name] && (
        <Alert variant="danger" style="mt-2 text-xs">
          {String(errors[name]?.message)}
        </Alert>
      )}
    </div>
  )
}
