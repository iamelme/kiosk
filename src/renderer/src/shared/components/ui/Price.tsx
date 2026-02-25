import { ReactNode } from 'react'
import { getCurrency } from 'locale-currency'

export default function Price({ value, locale = 'en-PH' }: { value: number, locale?: string }): ReactNode {

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
