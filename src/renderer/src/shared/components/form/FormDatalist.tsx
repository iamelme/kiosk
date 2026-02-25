import { useFormContext } from 'react-hook-form'
import Input from '../ui/Input'

type DatalistProps = {
  label: string
  name: string
  target: string
  options: { value: string; label: string }[] | undefined
}

export default function FormDatalist({
  label,
  name,
  target,
  options
}: DatalistProps): React.ReactElement {
  const { register } = useFormContext()
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <Input list={target} id={name} {...register(name)} />

      <datalist id={target}>
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </datalist>
    </>
  )
}
