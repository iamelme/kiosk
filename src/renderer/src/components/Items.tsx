import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type ItemsProps<T> = {
  items: T[]
  headers: { label: string; className?: string }[]
  renderItems: (item: T) => ReactNode
}

export default function Items<T>({
  headers,
  items,
  renderItems
}: ItemsProps<T>): React.JSX.Element {
  return (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full">
        <thead>
          <tr>
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
        <tbody className="[&_td]:py-1 align-top">{items?.map((item) => renderItems(item))}</tbody>
      </table>
    </div>
  )
}
