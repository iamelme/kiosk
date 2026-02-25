// import FormInput from '../../../shared/components/form/FormInput'
// import FormWrapper from '../../../shared/components/form/FormWrapper'
// import Alert from '../../../shared/components/ui/Alert'
import Button from '../../../shared/components/ui/Button'
// import { ProdInventoryType } from '../../../interfaces/IInventoryRepository'
// import useBoundStore from '../../../shared/stores//boundStore'
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
// import z from 'zod'
import useInventoryFetch from '../hooks/useInventoryFetch'
import Pagination from '../../../shared/components/Pagination'
import Input from '../../../shared/components/ui/Input'
import ListPage from '../../../shared/components/ListPage'
import DateFilter from '../../../shared/components/DateFilter'
import Items from '../../../shared/components/Items'
import { NumericFormat } from 'react-number-format'
import { movementType } from '../../../shared/utils/types'
import { humanize } from '../../../shared/utils'

// const schema = z.object({
//   id: z.coerce.number().optional(),
//   product_id: z.coerce.number(),
//   quantity: z.coerce.number()
// })
//
// type ValuesType = z.infer<typeof schema>

export default function Detail(): ReactNode {
  const { id } = useParams()

  const navigate = useNavigate()

  // const user = useBoundStore((state) => state.user)
  const [searchParams, setSearchParams] = useSearchParams()
  const [hasLastItem, setHasLastItem] = useState(false)

  const [startDate, setStartDate] = useState<string | Date>('')
  const [endDate, setEndDate] = useState<string | Date>('')

  const [pageSize, setPageSize] = useState(20)

  let dir = searchParams.get('dir')

  const cursorId = searchParams.get('cursorId')

  const { isPending, error, data } = useInventoryFetch({
    startDate: startDate && new Date(startDate).toISOString(),
    endDate: endDate && new Date(endDate).toISOString(),
    pageSize,
    id,
    cursorId,
    direction: dir ?? 'next', onHasLastItem: setHasLastItem
  })
  // const queryClient = useQueryClient()

  // const mutation = useMutation({
  //   mutationFn: async (formData: ProdInventoryType) => {
  //     if (!user?.id) return
  //     if (data?.quantity === formData.quantity) {
  //       navigate(-1)
  //       return
  //     }
  //     const { error } = await window.apiInventory.updateInventory({
  //       ...formData,
  //       user_id: user.id,
  //       movement_type: 2
  //     })
  //     if (error instanceof Error) {
  //       throw new Error(error.message)
  //     }
  //     navigate(-1)
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['inventory-products'] })
  //   }
  // })
  //
  if (isPending) {
    return <>Loading...</>
  }

  if (error) {
    return <>{error.message}</>
  }

  console.log({ data })



  console.log("movements", data?.movements, data?.movements?.length && data[data?.movements?.length - 1]?.id)

  return (
    <>

      <ListPage
        header={{
          left: {
            title: `${data?.productName}`,
            subTitle: 'Inventory Movement'
          },
          right: (
            <>
              <DateFilter
                startDate={startDate}
                endDate={endDate}
                onStartDate={setStartDate}
                onEndDate={setEndDate}
              />
              <div className='flex justify-end mt-3'>
                <Button variant='outline' size="sm" onClick={() => navigate(-1)}>Go Back</Button>
              </div>
            </>
          )
        }}
        isPending={isPending}
        error={error}
      >
        <>
          {data?.movements && (
            <>
              <Items
                items={data.movements}
                headers={[{ label: 'Date' }, { label: 'Last Quantity', className: 'text-right' }, { label: 'Movement Type' }, { label: 'Ref Type' }]}
                renderItems={(item) => (
                  <>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className='text-right'>{item.quantity}</td>
                    <td>{movementType[item.movement_type ?? 0]}</td>
                    <td>{humanize(item.reference_type)}</td>
                  </>
                )}
              />
            </>
          )}
        </>
        <div className="flex items-end justify-between gap-x-2">
          <div>

            {
              data && data?.movements?.length !== undefined &&
              <Pagination
                direction={dir}
                firstId={data?.movements?.[0]?.id}
                lastId={data?.movements?.[data.movements.length - 1]?.id}
                hasLastItem={hasLastItem}
                searchParams={searchParams}
                onSearchParams={setSearchParams}
              />
            }
          </div>
          <div>
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
        </div>
      </ListPage>

    </>
  )
}
