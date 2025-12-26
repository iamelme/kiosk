import { ReactNode, Ref } from 'react'
import { twMerge } from 'tailwind-merge'

type ItemsProps<T extends { id: string | number }> = {
  items: T[]
  headers: { label: string; className?: string }[]
  renderItems: (item: T) => ReactNode
  ref?: Ref<HTMLTableElement>
}

export default function Items<T extends { id: string | number }>({
  headers,
  items,
  renderItems,
  ref
}: ItemsProps<T>): React.JSX.Element {
  return (
    <div className="my-6 w-full max-h-lvh overflow-y-auto">
      <table className="w-full" ref={ref}>
        <thead>
          <tr className="sticky top-0 bg-white">
            {headers?.map((header, idx) => (
              <th
                key={idx}
                className={twMerge(
                  `text-xs uppercase font-medium text-left text-slate-400 ${header.className}`
                )}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:py-1 align-top">
          {items?.map((item) => (
            <tr key={item.id} data-selected="0" className="even:bg-white" tabIndex={0}>
              {renderItems(item)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
