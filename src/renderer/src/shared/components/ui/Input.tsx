import { twMerge } from 'tailwind-merge'

import { DetailedHTMLProps, InputHTMLAttributes } from 'react'

type InputProps = {
  className?: string
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export default function Input({ className, ...props }: InputProps): React.JSX.Element {
  return (
    <input
      {...props}
      className={twMerge(
        `w-full py-1 px-2 bg-white border border-slate-400 rounded-t-sm rounded-b-sm ${className}`
      )}
    />
  )
}
