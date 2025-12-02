import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

const styles = {
  variants: {
    default: 'bg-indigo-600 text-white',
    danger: 'bg-red-600 text-white',
    outline: 'border border-slate-200'
  },
  sizes: {
    default: 'py-2 px-4',
    icon: 'p-2'
  }
}

type Styles = typeof styles

type ButtonProps = {
  variant?: keyof Styles['variants']
  size?: keyof Styles['sizes']
  className?: string
  children: ReactNode
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export default function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button
      {...props}
      className={twMerge(
        `flex items-center ${styles.variants[variant]} ${styles.sizes[size]} rounded-sm  cursor-pointer`,
        className
      )}
    >
      {children}
    </button>
  )
}
