import Items from '../../../shared/components/Items'
import ListPage from '../../../shared/components/ListPage'
import Pagination from '../../../shared/components/Pagination'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Price from '../../../shared/components/ui/Price'
import useBoundStore from '../../../shared/stores//boundStore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { PlusCircle, Trash2 } from 'react-feather'
import { Link, useSearchParams } from 'react-router-dom'
import useProductsFetch from '../hooks/useProductsFetch'
import useDebounce from '../../../shared/hooks/useDebounce'

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

const pageSize = 20

export default function ProductPage(): React.JSX.Element {
  const user = useBoundStore((state) => state.user)
  const [searchTerm, setSearchTerm] = useState('')

  const dataGridRef = useRef<HTMLTableElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const [hasLastItem, setHasLastItem] = useState(false)
  let dir = searchParams.get('dir')

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

  const { isPending, error, data } = useProductsFetch({
    pageSize,
    userId: user?.id,
    searchTerm: useDebounce(searchTerm),
    cursorIdParam: searchParams.get('cursorId'),
    direction: dir,
    onHasLastItem: setHasLastItem
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (id: number) => window.apiProduct.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })

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
                onChange={e => setSearchTerm(e.target.value)}
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
            <>
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
                        onClick={() => mutation.mutate(Number(item.id))}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
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
        </>
      </ListPage>
    </>
  )
}
