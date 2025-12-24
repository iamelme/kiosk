import Summary from '@renderer/components/Summary'
import Alert from '@renderer/components/ui/Alert'
import Button from '@renderer/components/ui/Button'
import Input from '@renderer/components/ui/Input'
import Price from '@renderer/components/ui/Price'
import useBoundStore from '@renderer/stores/boundStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactNode, useRef, useState } from 'react'
import { Trash2 } from 'react-feather'
import { NumericFormat } from 'react-number-format'

export default function POS(): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputAmountRef = useRef<HTMLInputElement>(null)
  const inputRefNoRef = useRef<HTMLInputElement>(null)

  const [amount, setAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')

  const user = useBoundStore((state) => state.user)

  const { isPending, data, error } = useQuery({
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

      return (
        data ?? {
          id: 0,
          items: [],
          sub_total: 0,
          discount: 0,
          tax: 0,
          total: 0
        }
      )
    }
  })

  const queryClient = useQueryClient()

  const mutationInsert = useMutation({
    mutationFn: async (code: number): Promise<void> => {
      const { error, data: product } = await window.apiProduct.getProductByCode(code)
      console.log({ error, product })

      if (product) {
        if (inputRef.current && data?.id && user?.id) {
          const payload = {
            cart_id: data.id,
            user_id: user.id,
            product_id: product.id
          }
          console.log('submit ', payload)
          const { error } = await window.apiCart.insertItem(payload)
          if (error instanceof Error) {
            console.error(error.message)
            throw new Error(error.message)
          }
        }
      }

      if (error instanceof Error) {
        throw new Error(error.message)
      }
    },
    onError: (error) => {
      // An error happened!
      console.error(`insert item failed: ${error.message}`)
      // You can also show a toast notification here
      // toast.error('Uh oh! Something went wrong.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  })

  const mutationRemoveCart = useMutation({
    mutationFn: async () => {
      if (data) {
        await window.apiCart.deleteAllItems(data.id)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      mutationInsert.reset()
    }
  })

  const mutationUpdateDiscount = useMutation({
    mutationFn: async (discount: number) => {
      if (!data?.id) {
        return
      }
      console.log('data from mutate', data)
      console.log('discount from mutate', discount)

      await window.apiCart.updateDiscount({ discount, total: data?.total, cart_id: data?.id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      console.log('invalidate cart iwth discount')
    }
  })

  const mutationPlaceOrder = useMutation({
    mutationFn: async () => {
      // amount: number
      // reference_number: string
      // method: string
      // sale_id: number

      // movement_type INTEGER, --- IN, OUT, ADJUST
      // reference_type TEXT, --- SALES, PURCHASE, RETURN, TRANSFER, ADJUSTMENT
      // quantity INTEGER,
      // reference_id INTEGER, --- id from SALES, PURCHASE, RETURN, TRANSFER, ADJUSTMENT              user_id INTEGER,
      // product_id INTEGER,
      // user_id INTEGER,
      console.log('click id', data?.id)

      if (!data?.id || !user.id || !data?.items?.length) {
        throw new Error('Something went wrong')
      }

      // TODO:
      // user input for discount
      // remove specific cart item

      const payload = {
        cart: {
          items: data.items,
          sub_total: data.sub_total,
          discount: data.discount,
          total: data.total
        },
        amount: amount ?? 0,
        reference_number: inputRefNoRef.current ? inputRefNoRef.current.value : '',
        method: paymentMethod,
        sale_id: data.id,
        user_id: user.id
      }

      console.log({ payload })

      await window.apiSale.placeOrder(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      // mutationInsert.reset()
      handleClearCart()
    }
  })

  const handleSubmit = async (e): Promise<void> => {
    e.preventDefault()
    if (inputRef.current && data?.id && user.id && inputRef.current.value) {
      mutationInsert.mutate(Number(inputRef.current.value))
    }
  }

  const handleClearCart = async (): Promise<void> => {
    mutationRemoveCart.mutate()
    setPaymentMethod('cash')
    if (inputRefNoRef.current) {
      inputRefNoRef.current.value = ''
    }
  }

  const handlePlaceOrder = async (): Promise<void> => {
    mutationPlaceOrder.mutate()
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

  console.log({ mutationRemoveCart })

  if (error) {
    return <>Error</>
  }

  return (
    <div className="flex min-h-full">
      <div className="flex-1">
        <form onSubmit={handleSubmit}>
          <Input autoFocus ref={inputRef} placeholder="" />
          {mutationInsert.error && (
            <Alert variant="danger" className="my-3">
              {mutationInsert.error.message}
            </Alert>
          )}
        </form>

        <div className="mb-3">
          {data?.items?.map((item) => (
            <div key={item.id}>
              {item.code} - {item.name} {item.sku} {item.quantity} --- <Price value={item.price} />
            </div>
          ))}
        </div>
      </div>
      <aside className="w-[250px] px-4">
        <div className="flex justify-between gap-x-2">
          <h2 className="font-medium text-lg mb-3">Order Summary</h2>
          <div>
            <Button variant="danger" size="icon" title="Remove Order" onClick={handleClearCart}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
        <div className="mb-3">
          <Summary
            data={data}
            onChangeDiscount={(v) => {
              console.log('on change summary', v)

              mutationUpdateDiscount.mutate(v)
              // setDiscount(v)
            }}
          >
            <Summary.NoOfItems />
            <Summary.SubTotal />
            <Summary.Discount />
            <Summary.Tax />
            <Summary.Total />
          </Summary>
        </div>

        <div className="mb-3">
          <h3 className="mb-2 text-lg font-medium">Payment</h3>

          <div className="mb-3">
            <label htmlFor="method">Method</label>
            <select
              id="method"
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
              className="w-full py-1 px-2 border border-slate-400 rounded-md"
            >
              <option value="e-wallet">E-wallet</option>
              <option value="cash">Cash</option>
            </select>

            {paymentMethod !== 'cash' && (
              <div className="my-3">
                <label htmlFor="refNo">Reference No.</label>
                <Input ref={inputRefNoRef} id="refNo" />
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="amount">Amount Paid</label>

            <NumericFormat
              getInputRef={inputAmountRef}
              onValueChange={(values) => {
                const { floatValue } = values
                if (floatValue) {
                  setAmount(floatValue)
                }
              }}
              customInput={Input}
              thousandSeparator
              className="text-right"
            />
          </div>
        </div>

        <div className="">
          <Button full onClick={handlePlaceOrder} disabled={!data?.items?.length}>
            Place an Order
          </Button>
        </div>
      </aside>
    </div>
  )
}
