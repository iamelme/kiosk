import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

type MenuProps = {
  items: {
    label: string
    icon?: ReactNode
    to?: string
    children?: MenuProps['items']
  }[]
}

const Active = ({ isActive }): string =>
  `flex items-center gap-x-1 py-1 px-2 ${isActive ? 'bg-indigo-50 rounded-sm font-medium' : ''}`

export default function Menu({ items }: MenuProps): ReactNode {
  return (
    <ul className="flex flex-col space-x-5 py-3 px-4 [&>li]:mb-1 [&>li]:me-0">
      {items?.map((item, idx) => (
        <li key={idx}>
          {item?.children ? (
            <details open>
              <summary className="flex items-center gap-x-2 pl-2 text-slate-400 cursor-pointer">
                {item?.icon}
                {item.label}
              </summary>
              <ul className="flex flex-col gap-2 mt-2 ps-2 ms-2 border-s-1 border-slate-200 &_li:me-none">
                {item.children?.map((child, innerIdx) => (
                  <li key={innerIdx}>
                    {child?.to ? (
                      <NavLink to={child.to} className={Active}>
                        {child.icon} {child.label}
                      </NavLink>
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
            <NavLink to={item.to} className={Active}>
              {item.icon} {item.label}
            </NavLink>
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
