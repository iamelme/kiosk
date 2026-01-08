import Items from '@renderer/components/Items'
import Pagination from '@renderer/components/Pagination'
import Alert from '@renderer/components/ui/Alert'
import Price from '@renderer/components/ui/Price'
import useBoundStore from '@renderer/stores/boundStore'
import { humanize } from '@renderer/utils'
import { SaleType } from '@renderer/utils/types'
import { useQuery } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
// import { Link } from 'react-router-dom'

const headers = [
  { label: 'Invoice No.', className: '' },
  { label: 'Date', className: '' },
  { label: 'Subtotal', className: 'text-right' },
  { label: 'Discount', className: 'text-right' },
  { label: 'Tax', className: 'text-right' },
  { label: 'Total', className: 'text-right' },
  { label: 'Status', className: '' }
]

const pageSize = 10

export default function Sales(): ReactNode {
  const user = useBoundStore((state) => state.user)

  const [searchParams, setSearchParams] = useSearchParams()

  const [hasLastItem, setHasLastItem] = useState(false)
  let dir = searchParams.get('dir')

  const {
    data: sales,
    isPending,
    error
  } = useQuery({
    queryKey: ['sales', user.id, searchParams.get('currentId'), dir],
    queryFn: async (): Promise<SaleType[] | null> => {
      if (!user.id) {
        throw new Error('User not found')
      }

      const currentId = searchParams.get('currentId') ? Number(searchParams.get('currentId')) : 0

      dir = dir ?? 'next'

      const { data, error } = await window.apiSale.getAll({
        pageSize,
        cursorId: currentId,
        userId: user.id,
        direction: dir as 'prev' | 'next'
      })

      if (error instanceof Error) {
        throw new Error(error.message)
      }

      if (!data) {
        return null
      }

      // console.log(dir)

      // console.log('data ', data)
      setHasLastItem(false)

      if (data.length > pageSize) {
        setHasLastItem(true)
        data.pop()
      }

      return dir == 'next' ? data : data?.toReversed()
    }
  })

  // const queryClient = useQueryClient()

  // const mutationUpdateNav = useMutation({
  //   mutationFn: async (id: string) => {},
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['sales'] })
  //   }
  // })

  if (isPending) {
    return <>Loading...</>
  }

  console.log('sales', sales)

  if (error) {
    return <Alert variant="danger">{error.message}</Alert>
  }

  console.log('currentId', searchParams.get('currentId'))

  return (
    <>
      {sales && (
        <Items
          items={sales}
          headers={headers}
          renderItems={(item) => (
            <>
              <td>
                <Link to={`/sales/${item.id}`}>{item.invoice_number}</Link>
              </td>
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
      {sales && (
        <Pagination
          direction={dir}
          firstId={sales[0]?.id}
          lastId={sales[sales.length - 1]?.id}
          hasLastItem={hasLastItem}
          searchParams={searchParams}
          onSearchParams={setSearchParams}
        />
      )}
    </>
  )
}
