import React, { ReactNode } from 'react'

type ListPageProp = {
  header?: {
    left?: ReactNode
    right?: ReactNode
  }
  children: ReactNode
}

export default function ListPage({ header, children }: ListPageProp): React.JSX.Element {
  return (
    <>
      {header && (
        <div className="flex">
          <div className="flex-1">{header?.left}</div>
          <div className="flex-1">{header?.right}</div>
        </div>
      )}
      {children}
    </>
  )
}
