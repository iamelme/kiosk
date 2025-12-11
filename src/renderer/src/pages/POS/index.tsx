import Summary from '@renderer/components/Summary'
import Input from '@renderer/components/ui/Input'
import useBoundStore from '@renderer/stores/boundStore'
import { useQuery } from '@tanstack/react-query'
import { ReactNode, useRef } from 'react'

export default function POS(): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null)

  const user = useBoundStore((state) => state.user)
  const { isPending, error, data } = useQuery({
    queryKey: ['cart', user.id],
    queryFn: async () => {
      if (user.id) {
        const { error, data } = await window.apiCart.getByUserId(user.id)

        if (error instanceof Error) {
          throw new Error(error.message)
        }

        return data ?? []
        console.log('data', data)
      }
    }
  })

  if (isPending) {
    return <>Loading...</>
  }

  //   useEffect(() => {
  //     function keydown(e): void {
  //       if (e.key === '/') {
  //         e.preventDefault()
  //         if (inputRef.current) {
  //           inputRef.current.focus()
  //         }
  //       }
  //     }
  //     window.addEventListener('keydown', keydown)

  //     return () => {
  //       window.removeEventListener('keydown', keydown)
  //     }
  //   }, [])

  return (
    <div className="flex min-h-full">
      <div className="flex-1">
        <Input autoFocus ref={inputRef} placeholder="" />

        <div className="mb-3">
          {data && data?.map((item) => <div key={item.id}>{item.product_id}</div>)}
        </div>
      </div>
      <aside className="w-[250px] px-2">
        <Summary data={data}>
          <Summary.NoOfItems />
          <Summary.SubTotal />
          <Summary.Discount />
          <Summary.Tax />
          <Summary.Total />
        </Summary>
      </aside>
    </div>
  )
}
