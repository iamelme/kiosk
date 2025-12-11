import Items from '@renderer/components/Items'
import ListPage from '@renderer/components/ListPage'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const headers = [{ label: 'Product' }, { label: 'Qty' }, { label: '' }]

export default function Inventory(): ReactNode {
  const { isPending, error, data } = useQuery({
    queryKey: ['inventory-products'],
    queryFn: async () => {
      const { data } = await window.apiInventory.getAllInventory()
      return data
    }
  })

  return (
    <>
      <ListPage isPending={isPending} error={error}>
        {data && (
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
        )}
      </ListPage>
    </>
  )
}
