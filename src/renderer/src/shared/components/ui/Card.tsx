import { ReactNode } from 'react'

type CardType = {
  header?: ReactNode
  content: ReactNode
  footer?: ReactNode
}

export default function Card({ header, content, footer }: CardType): ReactNode {
  return (
    <div className="border border-slate-200 rounded-md">
      {header && <header className="py-2 px-3">{header}</header>}
      <div className="py-2 px-3">{content}</div>
      {footer && <footer className="py-2 px-3">{footer}</footer>}
    </div>
  )
}
