import { ReactNode } from 'react'
import TopItems from './TopItems'
import Card from '../../components/ui/Card'
import { Link } from 'react-router-dom'

export default function HomePage(): ReactNode {
  return (
    <div>
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
        content={<TopItems />}
      />
    </div>
  )
}
