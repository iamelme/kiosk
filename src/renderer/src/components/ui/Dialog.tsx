import {
  ButtonHTMLAttributes,
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useRef
} from 'react'
import Button, { type ButtonProps } from './Button'

type DialogContextType = {
  dialogRef: RefObject<HTMLDialogElement | null>
}

const DialogContext = createContext<DialogContextType | null>(null)

export default function Dialog({ children }: { children: ReactNode }): ReactNode {
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  return <DialogContext value={{ dialogRef }}>{children}</DialogContext>
}

const useDialogContext = (): DialogContextType => {
  const ctx = useContext(DialogContext)

  if (!ctx) {
    throw new Error('Component should be inside the context')
  }

  return ctx
}

function Trigger(
  props: ButtonHTMLAttributes<HTMLButtonElement> & Omit<ButtonProps, 'children'>
): ReactNode {
  const { dialogRef } = useDialogContext()
  const handleClick = (): void => {
    if (dialogRef.current) {
      console.log('dialog open')
      if (!dialogRef.current.open) {
        dialogRef.current.showModal()
        return
      }
      dialogRef.current.close()
    }
  }

  return (
    <Button onClick={handleClick} {...props}>
      {props.children}
    </Button>
  )
}

function Close(
  props: ButtonHTMLAttributes<HTMLButtonElement> & Omit<ButtonProps, 'children'>
): ReactNode {
  const { dialogRef } = useDialogContext()
  const handleClick = (): void => {
    if (dialogRef.current) {
      dialogRef.current.close()
    }
  }

  return (
    <Button onClick={handleClick} {...props}>
      {props.children}
    </Button>
  )
}

function Content({ children }: { children: ReactNode }): ReactNode {
  const { dialogRef } = useDialogContext()

  return (
    <dialog ref={dialogRef} className="left-[50%] translate-x-[-50%]">
      {children}
    </dialog>
  )
}

Dialog.Trigger = Trigger
Dialog.Content = Content
Dialog.Close = Close
