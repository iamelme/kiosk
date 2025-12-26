import Items from '@renderer/components/Items'
import Alert from '@renderer/components/ui/Alert'
import Price from '@renderer/components/ui/Price'
import useBoundStore from '@renderer/stores/boundStore'
import { humanize } from '@renderer/utils'
import { SaleType } from '@renderer/utils/types'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
// import { Link } from 'react-router-dom'

const headers = [
  { label: 'Date', className: '' },
  { label: 'Subtotal', className: 'text-right' },
  { label: 'Discount', className: 'text-right' },
  { label: 'Tax', className: 'text-right' },
  { label: 'Total', className: 'text-right' },
  { label: 'Status', className: '' }
]

export default function Sales(): ReactNode {
  const user = useBoundStore((state) => state.user)

  const {
    data: sales,
    isPending,
    error
  } = useQuery({
    queryKey: ['sales', user.id],
    queryFn: async (): Promise<SaleType[] | null> => {
      if (!user.id) {
        throw new Error('User not found')
      }

      const res = await window.apiSale.getAll(user.id)

      if (res.error && error instanceof Error) {
        throw new Error(error.message)
      }

      return res.data
    }
  })

  if (isPending) {
    return <>Loading...</>
  }

  console.log('sales', sales)

  if (error) {
    return <Alert variant="danger">{error.message}</Alert>
  }

  return (
    <>
      {sales && (
        <Items
          items={sales}
          headers={headers}
          renderItems={(item) => (
            <>
              <td>{String(new Date(item.created_at).toLocaleDateString())}</td>
              <td className="text-right">
                <Price value={item.sub_total} />
              </td>
              <td className="text-right">
                <Price value={item.discount} />
              </td>
              <td className="text-right">
                <Price value={item.tax} />
              </td>
              <td className="text-right">
                <Price value={item.total} />
              </td>
              <td className="">{humanize(item.status)}</td>
            </>
          )}
        />
      )}
    </>
  )
}
