import Items from '../../../shared/components/Items'
import Pagination from '../../../shared/components/Pagination'

import Price from '../../../shared/components/ui/Price'
import Alert from '../../../shared/components/ui/Alert'
import useBoundStore from '../../../shared/stores//boundStore'
import { humanize } from '../../../shared/utils'
import { SaleType } from '../../../shared/utils/types'
import { useQuery } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ListPage from '../../../shared/components/ListPage'
import DateFilter from '../../../shared/components/DateFilter'
import { NumericFormat } from 'react-number-format'
import Input from '../../../shared/components/ui/Input'
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


export default function Sales(): ReactNode {
  const user = useBoundStore((state) => state.user)

  const [searchParams, setSearchParams] = useSearchParams()

  const [hasLastItem, setHasLastItem] = useState(false)
  const [pageSize, setPageSize] = useState(50)

  const [startDate, setStartDate] = useState<Date | string>('')
  const [endDate, setEndDate] = useState<Date | string>('')

  let dir = searchParams.get('dir')

  const {
    data: sales,
    isPending,
    error
  } = useQuery({
    queryKey: ['sales', user.id, searchParams.get('cursorId'), dir],
    queryFn: async (): Promise<SaleType[] | null> => {
      if (!user.id) {
        throw new Error('User not found')
      }

      const cursorId = searchParams.get('cursorId') ? Number(searchParams.get('cursorId')) : 0

      dir = dir ?? 'next'

      const { data, error } = await window.apiSale.getAll({
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

  if (isPending) {
    return <>Loading...</>
  }

  console.log('sales', sales)

  if (error) {
    return <Alert variant="danger">{error.message}</Alert>
  }

  return (
    <>
      <ListPage
        header={{
          left: {
            title: 'Sales',
            subTitle: 'Sales Invoice'
          },
          right: (
            <>
              <DateFilter
                startDate={startDate}
                endDate={endDate}
                onStartDate={setStartDate}
                onEndDate={setEndDate}
              />
            </>
          )
        }}
        isPending={isPending}
        error={error}
      >
        <>
          {
            sales &&

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
          }
        </>

        <div className="flex items-center justify-end gap-x-2">
          <span>Per page</span>
          <div className="w-[100px]">
            <NumericFormat
              defaultValue={pageSize}
              customInput={Input}
              onValueChange={(values) => {
                const { floatValue } = values

                if (floatValue) {
                  setPageSize(floatValue)
                }
              }}
            />
          </div>
        </div>
      </ListPage>

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
