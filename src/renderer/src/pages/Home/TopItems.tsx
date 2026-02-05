import Alert from '../../components/ui/Alert'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'

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
    <>
      <ul>
        {data?.map((item) => (
          <li key={item.id} className="flex justify-between mb-2">
            <h3>{item.name}</h3>

            <h4 className="font-bold">{item.total_sales}</h4>
          </li>
        ))}
      </ul>
    </>
  )
}
