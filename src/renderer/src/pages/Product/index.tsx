import Items from '@renderer/components/Items'
import ListPage from '@renderer/components/ListPage'
import Pagination from '@renderer/components/Pagination'
import Button from '@renderer/components/ui/Button'
import Input from '@renderer/components/ui/Input'
import Price from '@renderer/components/ui/Price'
import useBoundStore from '@renderer/stores/boundStore'
// import Dropdown from '@renderer/components/ui/Dropdown'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { PlusCircle, Trash2 } from 'react-feather'
import { Link, useSearchParams } from 'react-router-dom'

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

  console.log('search', searchParams.get('cursorId'))

  const { isPending, error, data } = useQuery({
    queryKey: ['products', { search: searchTerm }, searchParams.get('cursorId'), dir],
    queryFn: async (searchTerm) => {
      if (!user.id) {
        throw new Error('User not found')
      }

      const term = searchTerm?.queryKey?.[1]?.search
      const test = await window.apiElectron.getLocale()

      console.log('test', test)

      if (term) {
        const { data } = await window.apiProduct.searchProduct(String(term))
        return data
      }

      const cursorId = searchParams.get('cursorId') ? Number(searchParams.get('cursorId')) : 0

      dir = dir ?? 'next'

      const { data, error } = await window.apiProduct.getAllProducts({
        pageSize,
        cursorId: cursorId,
        userId: user.id,
        direction: dir as 'prev' | 'next'
      })

      if (error instanceof Error) {
        throw new Error(error.message)
      }

      if (!data) {
        return null
      }
      setHasLastItem(false)

      if (data.length > pageSize) {
        setHasLastItem(true)
        data.pop()
      }

      return dir == 'next' ? data : data?.toReversed()
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
                        onClick={() => handleDelete(item.id)}
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
