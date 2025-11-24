import { useFormContext } from 'react-hook-form'

type FormInputProps = {
  name: string
  label?: string
}

export default function FormInput({ name, label }: FormInputProps): React.JSX.Element {
  const {
    register,
    formState: { errors }
  } = useFormContext()
  return (
    <div className="mb-4">
      {label && (
        <label className="flex" htmlFor={name}>
          {label}
        </label>
      )}
      <input id={name} {...register(name)} />
      {errors[name] && <div className="py-1 px-2 bg-red-200">{String(errors[name]?.message)}</div>}
    </div>
  )
}
