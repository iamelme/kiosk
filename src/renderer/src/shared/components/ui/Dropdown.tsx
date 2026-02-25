import { useClick, useFloating, useFocus, useInteractions } from '@floating-ui/react'
import { DetailedHTMLProps, HTMLAttributes, ReactNode, useState } from 'react'
import Button from './Button'
import { MoreHorizontal } from 'react-feather'

type DropdownProps = {
  className?: string
  children: ReactNode
  menu?: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
}

export default function Dropdown({ children, ...props }: DropdownProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    placement: 'bottom-end',
    onOpenChange(isOpen, event, reason) {
      setIsOpen(isOpen)
      event && console.log(event)
      reason && console.log(reason)
    }
  })

  console.log({ props })

  //   const hover = useHover(context)
  const focus = useFocus(context)
  const click = useClick(context, {
    stickIfOpen: false
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([focus, click])
  return (
    <>
      <Button ref={refs.setReference} {...getReferenceProps()} variant="outline" size="icon">
        <MoreHorizontal size={14} />
      </Button>
      {isOpen && (
        <div ref={refs.setFloating} style={floatingStyles} {...props.menu} {...getFloatingProps()}>
          {children}
        </div>
      )}
    </>
  )
}
