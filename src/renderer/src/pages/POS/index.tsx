import Summary from '@renderer/components/Summary'
import Input from '@renderer/components/ui/Input'
import Price from '@renderer/components/ui/Price'
import useBoundStore from '@renderer/stores/boundStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactNode, useRef } from 'react'

export default function POS(): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null)

  const user = useBoundStore((state) => state.user)
  const { isPending, data } = useQuery({
    queryKey: ['cart', user.id],
    queryFn: async () => {
      if (!user.id) {
        throw new Error('User not found')
        // return undefined
      }

      const { error, data } = await window.apiCart.getByUserId(user.id)

      console.log('error query', error)

      if (error instanceof Error) {
        throw new Error(error.message)
      }
      console.log('data', data)

      return data ?? undefined
    }
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: {
      cart_id: number
      user_id: number
      product_id: number
    }): Promise<void> => {
      await window.apiCart.insertItem(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] })
  })

  const handleSubmit = async (): Promise<void> => {
    if (inputRef.current && data?.id && user.id) {
      const payload = {
        cart_id: data.id,
        user_id: user.id,
        product_id: Number(inputRef.current.value)
      }
      console.log('submit ', payload)

      mutation.mutate(payload)
    }
  }

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
        <form onSubmit={handleSubmit}>
          <Input autoFocus ref={inputRef} placeholder="" />
        </form>

        <div className="mb-3">
          {data?.items?.map((item) => (
            <div key={item.id}>
              {item.code} - {item.name} {item.sku} {item.quantity} --- <Price value={item.price} />
            </div>
          ))}
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
