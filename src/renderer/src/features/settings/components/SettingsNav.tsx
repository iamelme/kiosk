import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type Props = {
  items: {
    label: string
    icon?: ReactNode
    to?: string
  }[]
}

const navClass = ({ isActive }) =>
  `
inline-flex items-center gap-x-1 border-b-2 border-red py-2 font-medium
${isActive ? 'text-indigo-600' : 'border-transparent'}
            `


export default function SettingsNav({ items }: Props): ReactNode {
  return (

    <nav className="flex gap-x-5 mb-5 border-b-2 border-slate-300">
      {
        items?.map((item, index) => (
          item?.to &&
          <NavLink key={index} to={item.to} className={navClass}
            end       >{item?.icon} {item.label}</NavLink>
        ))
      }
    </nav>
  )

}
