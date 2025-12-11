import Items from '@renderer/components/Items'
import ListPage from '@renderer/components/ListPage'
import Button from '@renderer/components/ui/Button'
import Input from '@renderer/components/ui/Input'
import Price from '@renderer/components/ui/Price'
// import Dropdown from '@renderer/components/ui/Dropdown'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { PlusCircle, Trash2 } from 'react-feather'
import { Link } from 'react-router-dom'

const Action = (): React.JSX.Element => (
  <div className="flex justify-end">
    <Link to="/products/new" tabIndex={-1}>
      <Button variant="default">
        <PlusCircle size={14} />
        Add
      </Button>
    </Link>
  </div>
)

const headers = [
  { label: 'Name', className: '' },
  { label: 'SKU', className: '' },
  { label: 'Code', className: '' },
  { label: 'Category', className: '' },
  { label: 'Qty', className: '' },
  { label: 'Price', className: 'text-right' },
  { label: '', className: 'text-right' }
]

export default function ProductPage(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')

  const dataGridRef = useRef<HTMLTableElement>(null)

  useEffect(() => {
    function focusElem(): void {
      if (dataGridRef.current && dataGridRef.current.contains(document.activeElement)) {
        console.log('dataGridRef', dataGridRef.current)

        console.log('Focus is inside the container')
      }
    }
    window.addEventListener('keydown', focusElem)

    return () => {
      window.removeEventListener('keydown', focusElem)
    }
  }, [])

  const { isPending, error, data } = useQuery({
    queryKey: ['products', { search: searchTerm }],
    queryFn: async (searchTerm) => {
      const term = searchTerm.queryKey[1].search
      const test = await window.apiElectron.getLocale()

      console.log('test', test)

      if (term) {
        const { data } = await window.apiProduct.searchProduct(String(term))
        return data
      }

      const { data } = await window.apiProduct.getAllProducts()
      return data
    }
  })
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (id: number) => window.apiProduct.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
  const handleSearch = (e): void => {
    const { value } = e.target

    setSearchTerm(value)
  }

  const handleDelete = (id: number): void => {
    mutation.mutate(id)
  }

  return (
    <>
      <ListPage
        header={{
          left: {
            title: 'Products',
            subTitle: 'All products with quantities'
          },
          right: (
            <div className="flex gap-x-2">
              <Input
                placeholder="Search a product..."
                autoFocus
                defaultValue={searchTerm}
                onChange={handleSearch}
              />
              <Action />
            </div>
          )
        }}
        isPending={isPending}
        error={error}
      >
        <>
          {data && (
            <Items
              ref={dataGridRef}
              items={data}
              headers={headers}
              renderItems={(item) => (
                <>
                  <td>
                    <Link to={`/products/${item.id}`} tabIndex={-1}>
                      {item.name}
                    </Link>
                  </td>
                  <td>{item.sku}</td>
                  <td>{item.code}</td>
                  <td>
                    <Link to={`/categories/${item.category_id}`} tabIndex={-1}>
                      {item.category_name}
                    </Link>
                  </td>
                  <td className="">{item.quantity}</td>
                  <td className="text-right">
                    <Price value={item.price} />
                  </td>
                  <td className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      tabIndex={-1}
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </>
              )}
            ></Items>
          )}
        </>
      </ListPage>
    </>
  )
}
