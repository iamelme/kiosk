import Input from './Input'

type DatalistProps = {
  label: string
  name: string
  target: string
  options: { value: string; label: string }[]
}

export default function Datalist({
  label,
  name,
  target,
  options
}: DatalistProps): React.ReactElement {
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <Input list={target} id={name} name={name} />

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
