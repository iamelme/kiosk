import { InputHTMLAttributes, ReactNode, useState } from 'react'
import { useFloating, useFocus, useInteractions } from '@floating-ui/react'
import Input from './Input'
import useComboboxContext, { ComboboxContext } from '@renderer/context/useComboboxContext'
import { twMerge } from 'tailwind-merge'

export default function Combobox({ children }: { children: ReactNode }): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen
  })

  const focus = useFocus(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([focus])
  return (
    <ComboboxContext
      value={{
        isOpen,
        setIsOpen,
        refs,
        floatingStyles,
        getReferenceProps,
        getFloatingProps
      }}
    >
      <div className="relative">{children}</div>
    </ComboboxContext>
  )
}

function Search({ ...props }: InputHTMLAttributes<HTMLInputElement>): ReactNode {
  const { refs, getReferenceProps, isOpen } = useComboboxContext()
  return (
    <Input
      ref={refs.setReference}
      {...props}
      {...getReferenceProps()}
      className={twMerge(props.className, `${isOpen ? 'rounded-b-none' : ''}`)}
    />
  )
}

function Empty({ children }: { children: ReactNode }): ReactNode {
  return <p>{children || 'No Content'}</p>
}

function List({ children }: { children: ReactNode }): React.ReactElement {
  const { isOpen, refs, floatingStyles, getFloatingProps } = useComboboxContext()
  return (
    <>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="w-full p-1 bg-white border rounded-b-md"
        >
          {children ? <ul className="flex flex-col">{children}</ul> : <p>No content</p>}
        </div>
      )}
    </>
  )
}

Combobox.Input = Search
Combobox.Empty = Empty
Combobox.List = List
