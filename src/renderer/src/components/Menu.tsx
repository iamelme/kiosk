import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type MenuProps = {
  items: {
    label: string
    icon?: ReactNode
    to?: string
    children?: MenuProps['items']
  }[]
}

export default function Menu({ items }: MenuProps): ReactNode {
  return (
    <ul className="flex flex-col space-x-5 py-3 px-4 [&>li]:mb-3 font-medium">
      {items?.map((item, idx) => (
        <li key={idx}>
          {item?.children ? (
            <details open>
              <summary className="flex items-center gap-x-1 text-slate-400 cursor-pointer">
                {item?.icon}
                {item.label}
              </summary>
              <ul className="flex flex-col gap-2 mt-2 px-2 border-s-1 border-slate-200">
                {item.children?.map((child, innerIdx) => (
                  <li key={innerIdx}>
                    {child?.to ? (
                      <Link to={child.to} className="flex items-center gap-x-1">
                        {child.icon} {child.label}
                      </Link>
                    ) : (
                      <>
                        {child.icon} {child.label}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          ) : item?.to ? (
            <Link to={item.to} className="flex items-center gap-x-1">
              {item.icon} {item.label}
            </Link>
          ) : (
            <>
              {item.icon} {item.label}{' '}
            </>
          )}
        </li>
      ))}
    </ul>
  )
}
