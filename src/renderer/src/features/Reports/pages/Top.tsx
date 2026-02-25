import Items from '../../../shared/components/Items'
import ListPage from '../../../shared/components/ListPage'
// import Pagination from '../../../shared/components/Pagination'
import Alert from '../../../shared/components/ui/Alert'
import Input from '../../../shared/components/ui/Input'
import { addDays, csvDownload } from '../../../shared/utils'
import { ReactNode, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { Link } from 'react-router-dom'
import DateFilter from '../../../shared/components/DateFilter'
import Button from '../../../shared/components/ui/Button'
import { Download } from 'react-feather'
import useTopItems from '../../../shared/hooks/useTopItems'

const headers = [
  { label: 'Name', className: '' },
  { label: 'Total Sales', className: 'text-right' }
]

export default function Top(): ReactNode {
  // const [searchParams, setSearchParams] = useSearchParams()
  // const [hasLastItem, setHasLastItem] = useState(false)
  //   const [lastTotal, setLastTotal] = useState(0)

  // filter
  const [startDate, setStartDate] = useState<Date | string>('')
  const [endDate, setEndDate] = useState<Date | string>('')

  const [pageSize, setPageSize] = useState(10)

  // let dir = searchParams.get('dir')

  // const { isPending, data, error } = useQuery({
  //   queryKey: ['top', pageSize, startDate, endDate, searchParams.get('cursorId'), dir],
  //   queryFn: async () => {
  //     dir = dir ?? 'next'
  //     const cursorId = searchParams.get('cursorId') ? Number(searchParams.get('cursorId')) : 0
  //     const lastTotal = searchParams.get('lastTotal') ? Number(searchParams.get('lastTotal')) : 0

  //     const { data, error } = await window.apiSale.getTopItems({
  //       pageSize,
  //       cursorId,
  //       lastTotal,
  //       startDate: startDate.toString(),
  //       endDate: endDate ? addDays(new Date(endDate), 1) : '',
  //       direction: dir as 'prev' | 'next'
  //     })

  //     console.log('data', data)
  //     console.log('error', error)

  //     if (error instanceof Error) {
  //       throw new Error(error.message)
  //     }

  //     if (!data) {
  //       return null
  //     }

  //     setHasLastItem(false)

  //     //   setSearchParams({
  //     //     ...searchParams,
  //     //     lastTotal: String(data[data.length - 1].total_sales)
  //     //   })
  //     if (data.length > pageSize) {
  //       setHasLastItem(true)
  //       //   setLastTotal(data[data.length - 1].total_sales)
  //       // data.pop()
  //     }

  //     return dir == 'next' ? data : data?.toReversed()
  //   }
  // })
  const { data, isPending, error } = useTopItems({
    pageSize,
    startDate,
    endDate: endDate ? addDays(new Date(endDate), 1) : ''
  })

  if (isPending) {
    return <>Loading...</>
  }

  if (error) {
    return <Alert variant="danger">{error.message}</Alert>
  }

  // console.log({ startDate, endDate })

  return (
    <>
      <ListPage
        header={{
          left: {
            title: 'Top Products',
            subTitle: 'Top selling products'
          },
          right: (
            <>
              <DateFilter
                startDate={startDate}
                endDate={endDate}
                onStartDate={setStartDate}
                onEndDate={setEndDate}
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  title="Download CSV"
                  onClick={() =>
                    csvDownload({
                      header: ['Product', 'Total'],
                      data: data?.map((d) => ({ name: d.name, total: d.net_quantity_sold })),
                      title: `${startDate} ${endDate}`
                    })
                  }
                >
                  <Download size={14} /> Download
                </Button>
              </div>
            </>
          )
        }}
        isPending={isPending}
        error={error}
      >
        <>
          {data && (
            <>
              <Items
                items={data}
                headers={headers}
                renderItems={(item) => (
                  <>
                    <td>
                      <Link to={`/products/${item.id}`} tabIndex={-1}>
                        {item.name}
                      </Link>
                    </td>
                    <td className="text-right">{item.net_quantity_sold}</td>
                  </>
                )}
              />

              {/* <div className="hidden">
                <Pagination
                  direction={dir}
                  firstId={data[0]?.id}
                  lastId={data[data.length - 1]?.id}
                  hasLastItem={hasLastItem}
                  searchParams={searchParams}
                  onSearchParams={setSearchParams}
                />
              </div> */}
            </>
          )}
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
    </>
  )
}
