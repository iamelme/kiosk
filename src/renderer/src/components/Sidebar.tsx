import { Link } from 'react-router-dom'
import { Box, Database, DollarSign, Grid, Home } from 'react-feather'

export default function Sidebar(): React.JSX.Element {
  return (
    <aside className="w-[175px] border-r border-slate-200">
      <ul className="flex flex-col space-x-5 py-3 px-4 [&>li]:mb-3 font-medium">
        <li>
          <Link to="/" className="flex items-center gap-x-1">
            <Home size={14} /> Home
          </Link>
        </li>
        <li>
          <details open>
            <summary className="flex items-center gap-x-1 text-slate-400 cursor-pointer">
              <Box size={14} />
              Products
            </summary>
            <ul className="flex flex-col gap-2 mt-2 px-2 border-s-1 border-slate-200">
              <li>
                <Link to="/categories" className="flex items-center gap-x-1">
                  <Grid size={14} /> Category
                </Link>
              </li>
              <li>
                <Link to="/products" className="flex items-center gap-x-1">
                  <Box size={14} />
                  Product
                </Link>
              </li>
            </ul>
          </details>
        </li>
        <li>
          <Link to="/products/verifier" className="flex items-center gap-x-1">
            <DollarSign size={14} />
            Price Verifier
          </Link>
        </li>
        <li>
          <Link to="/inventory" className="flex items-center gap-x-1">
            <Database size={14} />
            Inventory
          </Link>
        </li>
      </ul>
    </aside>
  )
}
