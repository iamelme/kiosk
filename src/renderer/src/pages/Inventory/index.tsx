import Items from '../../components/Items'
import ListPage from '../../components/ListPage'
import Pagination from '../../components/Pagination'
import { useQuery } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const headers = [{ label: 'Product' }, { label: 'Qty' }, { label: '' }]

const pageSize = 50

export default function Inventory(): ReactNode {
  const [searchParams, setSearchParams] = useSearchParams()
  const [hasLastItem, setHasLastItem] = useState(false)

  let dir = searchParams.get('dir')

  const { isPending, error, data } = useQuery({
    queryKey: ['inventory-products', searchParams.get('cursorId'), dir],
    queryFn: async () => {
      dir = dir ?? 'next'
      const cursorId = searchParams.get('cursorId') ? Number(searchParams.get('cursorId')) : 0
      const { data, error } = await window.apiInventory.getAllInventory({
        pageSize,
        cursorId,
        direction: dir as 'prev' | 'next'
      })

      if (error instanceof Error) {
        throw new Error(error.message)
      }

      setHasLastItem(false)

      if (data.length > pageSize) {
        setHasLastItem(true)
        data.pop()
      }

      return dir == 'next' ? data : data?.toReversed()
    }
  })

  return (
    <>
      <ListPage isPending={isPending} error={error}>
        {data && (
          <>
            <Items
              items={data}
              headers={headers}
              renderItems={(item) => (
                <>
                  <td>
                    <Link to={`/inventory/${item.id}`}>{item.name} </Link>
                  </td>
                  <td>{item.quantity}</td>
                </>
              )}
            />
            <Pagination
              direction={dir}
              firstId={data[0]?.id}
              lastId={data[data.length - 1]?.id}
              hasLastItem={hasLastItem}
              searchParams={searchParams}
              onSearchParams={setSearchParams}
            />
          </>
        )}
      </ListPage>
    </>
  )
}
