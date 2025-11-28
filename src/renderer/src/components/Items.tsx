import { ReactNode } from 'react'

type ItemsProps<T> = {
  items: T[]
  renderItems: (item: T) => ReactNode
}

export default function Items<T>({ items, renderItems }: ItemsProps<T>): React.JSX.Element {
  return (
    <table className="w-full">
      <tbody>{items?.map((item) => renderItems(item))}</tbody>
    </table>
  )
}
