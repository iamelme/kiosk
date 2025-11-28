import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

const styles = {
  default: 'bg-indigo-600 rounded-sm text-white',
  danger: 'bg-red-600 text-white'
}

type Styles = typeof styles

type ButtonProps = {
  variant?: keyof Styles
  className?: string
  children: ReactNode
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export default function Button({
  className,
  variant = 'default',
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button {...props} className={twMerge(`${styles[variant]} py-1 px-4 `, className)}>
      {children}
    </button>
  )
}
