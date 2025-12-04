import { ReferenceType } from '@floating-ui/react'
import { createContext, MutableRefObject, useContext } from 'react'

type ContetType = {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  floatingStyles: React.CSSProperties
  refs: {
    reference: MutableRefObject<ReferenceType | null>
    floating: React.MutableRefObject<HTMLElement | null>
    setReference: (node: ReferenceType | null) => void
    setFloating: (node: HTMLElement | null) => void
  }
  getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>
  getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>
}

export const ComboboxContext = createContext<ContetType | null>(null)

const useComboboxContext = (): ContetType => {
  const ctx = useContext(ComboboxContext)

  if (!ctx) {
    throw new Error('Context must be use inside a compound component')
  }

  return ctx
}

export default useComboboxContext
