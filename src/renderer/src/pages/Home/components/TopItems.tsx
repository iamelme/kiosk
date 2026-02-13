import Card from '../../../components/ui/Card'
import Alert from '../../../components/ui/Alert'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export default function TopItems(): ReactNode {
  const date = new Date()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)

  const { data, isPending, error } = useQuery({
    queryKey: ['home'],
    queryFn: async () => {
      const { data, error } = await window.apiSale.getTopItems({
        pageSize: 5,
        cursorId: 0,
        lastTotal: 0,
        startDate: firstDay.toISOString(),
        endDate: lastDay.toISOString()
      })

      if (error instanceof Error) {
        throw new Error(error.message)
      }

      console.log('top data', data)

      return data
    }
  })

  if (isPending) {
    return <>Loading...</>
  }

  if (error) {
    return <Alert variant="danger">{error.message}</Alert>
  }

  return (
    <Card
      header={
        <div className="flex justify-between pb-3 border-b border-slate-300">
          <div>
            <h2 className="text-lg font-medium">Top Selling Products</h2>
            <p className="text-xs opacity-70">This month</p>
          </div>
          <Link to="/reports/sales">See more</Link>
        </div>
      }
      content={
        <ul>
          {data?.map((item) => (
            <li key={item.id} className="flex justify-between mb-2">
              <h3>{item.name}</h3>

              <h4 className="font-bold">{item.net_quantity_sold}</h4>
            </li>
          ))}
        </ul>
      }
    />
  )
}
