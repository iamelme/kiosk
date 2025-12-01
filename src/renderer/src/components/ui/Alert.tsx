import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

const styles = {
  variant: {
    default: 'bg-gray-200',
    danger: 'bg-red-200'
  }
}

type Styles = typeof styles

type AlertProps = {
  variant: keyof Styles['variant']
  style?: string
  children: ReactNode
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export default function Alert({
  variant = 'default',
  style,
  children,
  ...props
}: AlertProps): React.ReactElement {
  return (
    <div {...props} className={twMerge(`py-2 px-3 rounded-md ${styles.variant[variant]}`, style)}>
      {children}
    </div>
  )
}
