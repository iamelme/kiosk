import { createContext, ReactNode, useContext } from 'react'
import { Trash2 } from 'react-feather'
import Button from './ui/Button'
import Price from './ui/Price'
import { ReturnCartType } from '@renderer/utils/types'

const SummaryContext = createContext<ReturnCartType | undefined>(undefined)

export default function Summary({
  data,
  children
}: {
  data: ReturnCartType | undefined
  children: ReactNode
}): ReactNode {
  console.log('ctx data', data)

  return (
    <SummaryContext value={data}>
      <div className="flex justify-between gap-x-2">
        <h2 className="font-medium text-xl mb-3">Order Summary</h2>
        <div>
          <Button variant="danger" size="icon" title="Remove Order">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-y-2">{children}</div>
    </SummaryContext>
  )
}

const useSummaryContext = (): ReturnCartType => {
  const ctx = useContext(SummaryContext)

  if (!ctx) {
    throw new Error('Component should be inside the context')
  }

  return ctx
}

function NoOfItems(): ReactNode {
  const ctx = useSummaryContext()

  const num = ctx?.items?.reduce((acc, cur) => (acc += cur.quantity), 0)

  return (
    <dl className="flex justify-between">
      <dt>No. of Items:</dt>
      <dd>{num ?? 0}</dd>
    </dl>
  )
}

function SubTotal(): ReactNode {
  const ctx = useSummaryContext()

  //   const subTotal = ctx?.reduce((acc, cur) => (acc += cur.quantity * cur.price), 0)

  return (
    <dl className="flex justify-between">
      <dt>Sub Total:</dt>
      <dd>
        <Price value={ctx.sub_total} />
      </dd>
    </dl>
  )
}

function Discount(): ReactNode {
  const ctx = useSummaryContext()

  return (
    <dl className="flex justify-between">
      <dt>Discount:</dt>
      <dd>
        <Price value={ctx.discount} />
      </dd>
    </dl>
  )
}

function Tax(): ReactNode {
  // const ctx = useSummaryContext()

  return (
    <dl className="flex justify-between">
      <dt>Tax:</dt>
      <dd>
        <Price value={0} />
      </dd>
    </dl>
  )
}

function Total(): ReactNode {
  const ctx = useSummaryContext()

  return (
    <dl className="flex justify-between text-xl">
      <dt className="font-medium">Total:</dt>
      <dd>
        <Price value={ctx.total} />
      </dd>
    </dl>
  )
}

Summary.NoOfItems = NoOfItems
Summary.SubTotal = SubTotal
Summary.Discount = Discount
Summary.Tax = Tax
Summary.Total = Total
