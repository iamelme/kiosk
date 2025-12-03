import Items from '@renderer/components/Items'
import ListPage from '@renderer/components/ListPage'
import Button from '@renderer/components/ui/Button'
// import Dropdown from '@renderer/components/ui/Dropdown'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'react-feather'
import { Link } from 'react-router-dom'

const Action = (): React.JSX.Element => (
  <div className="flex justify-end">
    <Link to="/products/new">
      <Button variant="default">Add</Button>
    </Link>
  </div>
)

export default function ProductPage(): React.JSX.Element {
  const { isPending, error, data } = useQuery({
    queryKey: ['products'],
    queryFn: async () => window.apiProduct.getAllProducts()
  })
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (id: number) => window.apiProduct.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })

  if (isPending) {
    return <>Loading...</>
  }

  if (error) {
    return <>{error.message}</>
  }

  const handleDelete = (id: number): void => {
    mutation.mutate(id)
  }

  return (
    <ListPage
      header={{
        left: <h2>Products</h2>,
        right: <Action />
      }}
    >
      <Items
        items={data}
        renderItems={(item) => (
          <tr key={item.id}>
            <td>
              <Link to={`/products/${item.id}`}>{item.name}</Link>
            </td>
            <td>{item.sku}</td>
            <td>
              <Link to={`/categories/${item.category_id}`}>{item.category_name}</Link>
            </td>
            <td className="text-right">{item.price / 100}</td>
            <td className="text-right">
              <Button variant="outline" size="icon" onClick={() => handleDelete(item.id)}>
                <Trash2 size={14} />
              </Button>
              {/* <Dropdown menu={{ className: 'w-[100px] p-3 border border-slate-200 rounded-sm' }}>
                <ul className="">
                  <li>
                    <Button size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </li>
                </ul>
              </Dropdown> */}
            </td>
          </tr>
        )}
      ></Items>
    </ListPage>
  )
}
