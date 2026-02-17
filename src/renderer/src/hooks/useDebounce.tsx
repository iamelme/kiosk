import { useEffect, useState } from 'react'

export default function useDebounce(input: string, time = 1200): string {
  const [value, setValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setValue(input)
    }, time)

    return () => {
      clearTimeout(timer)
    }
  }, [input, time])
  return value
}
