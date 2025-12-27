import Items from '@renderer/components/Items'
import Alert from '@renderer/components/ui/Alert'
import Price from '@renderer/components/ui/Price'
import { humanize, saleStatuses } from '@renderer/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
const headers = [
  { label: 'Name', className: '' },
  { label: 'Quantity', className: 'text-right' },
  { label: 'Unit Cost', className: 'text-right' },
  { label: 'Unit Price', className: 'text-right' },
  { label: 'Total', className: 'text-right' }
]

export default function Detail(): ReactNode {
  const { id } = useParams()

  const { data, error } = useQuery({
    queryKey: [id],
    queryFn: async () => {
      if (!Number(id)) {
        throw new Error('No invoice found')
      }
      const { data, error } = await window.apiSale.getById(Number(id))

      if (error instanceof Error) {
        throw new Error(error.message)
      }

      return data
    }
  })

  const queryClient = useQueryClient()

  const mutationUpdateStatus = useMutation({
    mutationFn: async (status: string) => {
      if (!Number(id)) {
        return
      }
      const { success, error } = await window.apiSale.updateSaleStatus({ id: Number(id), status })
      if (error instanceof Error) {
        throw new Error(error.message)
      }

      return success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [id] })
    }
  })
  if (error) {
    return <Alert variant="danger">{error.message}</Alert>
  }

  if (!data) {
    return <Alert variant="danger">No Details for this Sales Invoice</Alert>
  }
  console.log('data', data)

  return (
    <>
      <div className="flex justify-end">
        <div className="text-right">
          <h2 className="font-bold">Invoice No.</h2>
          <p className="text-xl">{data?.invoice_number}</p>
          <p>{new Date(data.created_at).toLocaleString()}</p>

          <p>
            {mutationUpdateStatus.error && (
              <Alert className="my-3" variant="danger">
                {mutationUpdateStatus.error?.message}
              </Alert>
            )}
            <select
              defaultValue={data.status}
              onChange={(e) => mutationUpdateStatus.mutate(e.target.value)}
            >
              {saleStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </p>
        </div>
      </div>
      {data?.items && (
        <>
          <h3 className="font-medium mb-2">Line Items</h3>
          <div className="mb-3 border border-slate-300 rounded-md">
            <Items
              items={data.items}
              headers={headers}
              renderItems={(item) => (
                <>
                  <td>
                    <Link to={`/products/${item.product_id}`}>
                      {item.name}
                      {item.code}
                    </Link>
                  </td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">
                    <Price value={item.unit_cost} />
                  </td>
                  <td className="text-right">
                    <Price value={item.unit_price} />
                  </td>
                  <td className="text-right">
                    <Price value={item.unit_price * item.quantity} />
                  </td>
                </>
              )}
            />
          </div>
        </>
      )}

      <div className="flex justify-end">
        <div className="flex flex-col gap-y-2">
          <dl className="flex justify-between gap-x-4">
            <dt className="">Sub Total:</dt>
            <dd>
              <Price value={data?.sub_total} />
            </dd>
          </dl>
          <dl className="flex justify-between gap-x-4">
            <dt className="">Discount:</dt>
            <dd>
              (
              <Price value={data?.discount} />)
            </dd>
          </dl>
          <dl className="flex justify-between gap-x-4 font-bold">
            <dt className="">Total:</dt>
            <dd>
              <Price value={data?.total} />
            </dd>
          </dl>
          <dl className="flex justify-between gap-x-4 ">
            <dt className="">Paid Amount:</dt>
            <dd>
              <Price value={data?.amount} />
            </dd>
          </dl>
          <dl className="flex justify-between gap-x-4 ">
            <dt className="">Change Due:</dt>
            <dd>
              <Price value={data?.total - data?.amount} />
            </dd>
          </dl>

          <dl className="flex justify-between gap-x-4 border-t border-b my-3 py-3">
            <dt className="">Payment Method:</dt>
            <dd>{humanize(data?.method)}</dd>
          </dl>
        </div>
      </div>
    </>
  )
}
