import { ReactNode, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import Combobox from '../ui/Combobox'
import Alert from '../ui/Alert'

type FormComboboxProps = {
  label?: string
  name: string
  options: Record<string, string>[]
}

export default function FormCombobox({ label, name, options }: FormComboboxProps): ReactNode {
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = useFormContext()

  //   const [defaultValue, setDefaultValue] = useState()

  useEffect(() => {
    if (options?.length) {
      setValue(name, options.find((opt) => opt.value === name)?.value)
    }
  }, [name, setValue, options])
  // console.log('options', options)

  const defaultValue = options?.find((opt) => Number(opt.value) === Number(watch(name)))?.label

  // console.log('defaultValue', defaultValue, 'name', name, 'watch', watch(name))

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
      <Combobox {...register(name)} options={options}>
        {!options && <Combobox.Empty />}
        <Combobox.Input
          defaultValue={defaultValue}
          key={defaultValue}
          className={`${errors[name] ? 'border-red-400' : ''}`}
        />
        <Combobox.List onSelect={(value) => setValue(name, value)} />
      </Combobox>
      {errors[name] && (
        <Alert variant="danger" className="mt-2 text-xs">
          {String(errors[name]?.message)}
        </Alert>
      )}
    </div>
  )
}
