import { Link } from 'react-router-dom'
import { Box, DollarSign, Grid, Home } from 'react-feather'

export default function Sidebar(): React.JSX.Element {
  return (
    <aside className="border-r border-slate-200">
      <ul className="flex flex-col space-x-5 py-3 px-4 [&>li]:mb-3 font-medium">
        <li>
          <Link to="/" className="flex items-center gap-x-1">
            <Home size={14} /> Home
          </Link>
        </li>
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
        <li>
          <Link to="/products/verifier" className="flex items-center gap-x-1">
            <DollarSign size={14} />
            Price Verifier
          </Link>
        </li>
      </ul>
    </aside>
  )
}
