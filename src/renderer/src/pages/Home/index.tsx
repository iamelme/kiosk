import { ReactNode } from 'react'
import TopItems from './components/TopItems'
import Rev from './components/Sales'
import useBoundStore from '../../stores/boundStore'

export default function HomePage(): ReactNode {
  const user = useBoundStore((state) => state.user)

  const amPm = new Date().toLocaleString().split(' ')[2]

  let isMorning = true
  if (amPm === 'PM') {
    isMorning = false
  }

  return (
    <div>
      <header className="mb-4">
        <h2 className="text-lg font-medium">
          Hello, {user.user_name} {isMorning ? <>&#9728;</> : <>&#127769;</>}{' '}
        </h2>
      </header>
      <Rev />
      <TopItems />
    </div>
  )
}
