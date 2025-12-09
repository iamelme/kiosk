import { Box, Database, DollarSign, Grid, Home, ShoppingCart } from 'react-feather'
import Menu from './Menu'
import Button from './ui/Button'
import useBoundStore from '@renderer/stores/boundStore'

const menu = [
  {
    label: 'Home',
    to: '/',
    icon: <Home size={14} />
  },
  {
    label: 'POS',
    to: '/post',
    icon: <ShoppingCart size={14} />
  },
  {
    label: 'Products',
    icon: <Box size={14} />,
    children: [
      {
        label: 'Categories',
        to: `/categories`,
        icon: <Grid size={14} />
      },
      {
        label: 'Products',
        to: `/products`,
        icon: <Box size={14} />
      }
    ]
  },
  {
    label: 'Price Verifier',
    to: `/price-verifier`,
    icon: <DollarSign size={14} />
  },
  {
    label: 'Inventory',
    to: `/inventory`,
    icon: <Database size={14} />
  }
]

export default function Sidebar(): React.JSX.Element {
  const updateUser = useBoundStore((state) => state.updateUser)

  return (
    <aside className="flex flex-col justify-between w-[200px] border-r border-slate-200">
      <Menu items={menu} />

      <div className="py-2 px-4">
        <Button
          variant="outline"
          onClick={() => updateUser({ id: undefined, user_name: undefined })}
          className="w-full"
        >
          Logout
        </Button>
      </div>
    </aside>
  )
}
