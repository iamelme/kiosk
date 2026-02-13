import Price from '../../../components/ui/Price'
import Alert from '../../../components/ui/Alert'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import Card from '../../../components/ui/Card'

export default function Sales(): ReactNode {
  const date = new Date()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)

  const { data, isPending, error } = useQuery({
    queryKey: ['revenue'],
    queryFn: async () => {
      const { data, error } = await window.apiSale.getRevenue({
        startDate: firstDay.toISOString(),
        endDate: lastDay.toISOString()
      })

      if (error instanceof Error) {
        throw new Error(error.message)
      }

      return data
    }
  })

  if (isPending) {
    return <>Loading...</>
  }

  if (error || !data) {
    return <Alert variant="danger">{error?.message || 'something went wrong'}</Alert>
  }

  console.log({ data })

  return (
    <div className="flex gap-3 mb-3">
      <div className="flex-1">
        <Card
          header={
            <div className="flex justify-between">
              <div>
                <h2 className="text-md font-medium">Gross Revenue</h2>
                <p className="text-xs opacity-70">This month</p>
              </div>
            </div>
          }
          content={
            <div
              className={`inline py-1 px-2 rounded-md ${data?.gross_revenue > 0 ? 'bg-green-100' : 'bg-red-100'}`}
            >
              <Price value={data?.gross_revenue} />
            </div>
          }
        />
      </div>
      <div className="flex-1">
        <Card
          header={
            <div className="flex justify-between">
              <div>
                <h2 className="text-md font-medium">Total Returns</h2>
                <p className="text-xs opacity-70">This month</p>
              </div>
            </div>
          }
          content={
            <div className={`inline py-1 px-2 rounded-md bg-red-100`}>
              <Price value={data?.total_return} />
            </div>
          }
        />
      </div>
      <div className="flex-1">
        <Card
          header={
            <div className="flex justify-between">
              <div>
                <h2 className="text-md font-medium">Net Sales</h2>
                <p className="text-xs opacity-70">This month</p>
              </div>
            </div>
          }
          content={
            <div
              className={`inline py-1 px-2 rounded-md ${data?.net_revenue > 0 ? 'bg-green-100' : 'bg-red-100'}`}
            >
              <Price value={data?.net_revenue} />
            </div>
          }
        />
      </div>
    </div>
  )
}
