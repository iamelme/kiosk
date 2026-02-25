import { ReactNode } from 'react'
import Button from './ui/Button'
import { SetURLSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'react-feather'

type PaginationProps = {
  direction: string | null
  firstId: number
  lastId: number
  hasLastItem: boolean
  searchParams: URLSearchParams
  onSearchParams: SetURLSearchParams
}

export default function Pagination({
  direction,
  firstId,
  lastId,
  hasLastItem,
  searchParams,
  onSearchParams
}: PaginationProps): ReactNode {
  return (
    <div className="flex gap-x-2">
      <Button
        size="sm"
        variant="outline"
        disabled={(direction === 'prev' && !hasLastItem) || !direction}
        onClick={() => {
          onSearchParams({
            ...searchParams,
            dir: 'prev',
            cursorId: String(firstId)
          })
        }}
      >
        <ChevronLeft size={14} />
        Prev
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={direction !== 'prev' && !hasLastItem}
        onClick={() => {
          onSearchParams({
            ...searchParams,
            dir: 'next',
            cursorId: String(lastId)
          })
        }}
      >
        Next <ChevronRight size={14} />
      </Button>
    </div>
  )
}
