import Items from '@renderer/components/Items'
import ListPage from '@renderer/components/ListPage'
import Button from '@renderer/components/ui/Button'
import { useQuery } from '@tanstack/react-query'
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

  if (isPending) {
    return <>Loading...</>
  }

  if (error) {
    return <>{error.message}</>
  }

  return (
    <>
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
              <td>
                <Link to={`/categories/${item.category_id}`}>{item.category_name}</Link>
              </td>
              <td className="text-right">{item.price / 100}</td>
            </tr>
          )}
        ></Items>
      </ListPage>
    </>
  )
}
