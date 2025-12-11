import useBoundStore from '@renderer/stores/boundStore'
import { ReactNode } from 'react'
import { getCurrency } from 'locale-currency'

export default function Price({ value }: { value: number }): ReactNode {
  const locale = useBoundStore((state) => state.locale)

  if (isNaN(value)) {
    return null
  }

  return (
    <>
      {new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: getCurrency(locale) as string
      }).format(value / 100)}
    </>
  )
}
