import Input from '../../../components/ui/Input'
import { ReactNode } from 'react'

type DateFilterProps = {
  startDate: string | Date
  endDate: string | Date
  onStartDate: (v: string) => void
  onEndDate: (v: string) => void
}

export default function DateFilter({
  startDate,
  endDate,
  onStartDate,
  onEndDate
}: DateFilterProps): ReactNode {
  return (
    <>
      <div className="flex gap-x-2">
        <Input
          type="date"
          autoFocus
          onChange={(e) =>
            e.target.value ? onStartDate(new Date(e.target.value).toISOString()) : onStartDate('')
          }
          max={new Date().toISOString().split('T')[0]}
          value={startDate && new Date(startDate).toISOString().substring(0, 10)}
        />
        <Input
          type="date"
          onChange={(e) =>
            e.target.value ? onEndDate(new Date(e.target.value).toISOString()) : onEndDate('')
          }
          min={startDate ? new Date(startDate).toISOString().split('T')[0] : ''}
          max={new Date().toISOString().split('T')[0]}
          value={endDate ? new Date(endDate).toISOString().substring(0, 10) : ''}
        />
      </div>
    </>
  )
}
