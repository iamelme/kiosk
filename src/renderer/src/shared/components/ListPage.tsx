import React, { ReactNode } from 'react'
import Alert from './ui/Alert'

type ListPageProp = {
  header?: {
    left?: {
      title: string
      subTitle?: string
    }
    right?: ReactNode
  }
  isPending: boolean
  error: Error | null
  children: ReactNode
}

export default function ListPage({
  header,
  isPending,
  error,
  children
}: ListPageProp): React.JSX.Element {
  return (
    <>
      {header && (
        <div className="flex">
          <div className="flex-1">
            <h2 className="text-xl">{header?.left?.title}</h2>
            <p className="text-slate-400">{header?.left?.subTitle}</p>
          </div>
          <div className="flex-1">{header?.right}</div>
        </div>
      )}
      {error && <Alert variant="danger">{error.message}</Alert>}
      {isPending ? (
        <div className="mx-auto w-full rounded-md border border-slate-200 p-4">
          <div className="flex animate-pulse space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                <div className="col-span-1 h-2 rounded bg-gray-200"></div>
              </div>
              <div className="space-y-3">
                <div className="h-2 rounded bg-gray-200"></div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                  <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                  <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                  <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                </div>
                <div className="h-2 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </>
  )
}
