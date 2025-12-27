import Items from '@renderer/components/Items'
import Summary from '@renderer/components/Summary'
import Alert from '@renderer/components/ui/Alert'
import Button from '@renderer/components/ui/Button'
import Dialog from '@renderer/components/ui/Dialog'
import Input from '@renderer/components/ui/Input'
import Price from '@renderer/components/ui/Price'
import useBoundStore from '@renderer/stores/boundStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactNode, useRef, useState } from 'react'
import { Edit, Trash2, X } from 'react-feather'
import { NumericFormat } from 'react-number-format'
import { Link } from 'react-router-dom'

const headers = [
  { label: 'Name', className: '' },
  { label: 'SKU', className: '' },
  { label: 'Code', className: '' },
  { label: 'Qty', className: '' },
  { label: 'Price', className: 'text-right' },
  { label: '', className: 'text-right' }
]

export default function POS(): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputAmountRef = useRef<HTMLInputElement>(null)
  const inputRefNoRef = useRef<HTMLInputElement>(null)
  const btnUpdateQtyRef = useRef({})

  const setBtnRef = (item, el): void => {
    if (el) {
      btnUpdateQtyRef.current[item.id] = el
    } else {
      delete btnUpdateQtyRef.current[item.id]
    }
  }

  const [amount, setAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')

  const [quantity, setQuantity] = useState(0)

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
      setAmount(0)
      setPaymentMethod('cash')
      if (inputRefNoRef.current) {
        inputRefNoRef.current.value = ''
      }
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

  const mutationUpdateItemQty = useMutation({
    mutationFn: async (id: number) => {
      if (!data?.id) {
        return
      }

      await window.apiCart.updateItemQty({ id, cart_id: data.id, quantity })
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      setQuantity(0)

      if (btnUpdateQtyRef.current) {
        btnUpdateQtyRef.current[variables].click()
      }
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

      const { success, error } = await window.apiSale.placeOrder(payload)

      if (error instanceof Error) {
        throw new Error(error.message)
      }

      return success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      // mutationInsert.reset()
      mutationRemoveCart.mutate()
    }
  })

  const mutationRemoveItem = useMutation({
    mutationFn: async (id: number) => {
      if (data?.id) await window.apiCart.removeItem(id, data?.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      console.log('onsuccess data', data)

      if (data?.items?.length === 1) {
        mutationRemoveCart.mutate()
      }
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
  }

  const handlePlaceOrder = async (): Promise<void> => {
    mutationPlaceOrder.mutate()
  }

  const handleRemoveItem = async (id: number): Promise<void> => {
    mutationRemoveItem.mutate(id)
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

  console.log(btnUpdateQtyRef)

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
          <Items
            items={data?.items}
            headers={headers}
            renderItems={(item) => (
              <>
                <td>
                  <Link to={`/products/${item.product_id}`} tabIndex={-1}>
                    {item.name}
                  </Link>
                </td>
                <td>{item.sku}</td>
                <td>{item.code}</td>
                <td className="">{item.quantity}</td>
                <td className="text-right">
                  <Price value={item.price} />
                </td>
                <td>
                  <div className="flex gap-x-2 justify-end">
                    <Dialog>
                      <Dialog.Trigger
                        ref={(el) => setBtnRef(item, el)}
                        size="icon"
                        variant="outline"
                      >
                        <Edit size={14} />
                      </Dialog.Trigger>
                      <Dialog.Content>
                        {item?.id}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            mutationUpdateItemQty.mutate(item.id)
                          }}
                        >
                          <Input
                            type="number"
                            defaultValue={item.quantity}
                            onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                          />
                        </form>
                        <div className="flex gap-x-2">
                          <Button onClick={() => mutationUpdateItemQty.mutate(item.id)} size="sm">
                            Update
                          </Button>
                          <Dialog.Close variant="outline" size="icon">
                            <X size={14} />
                          </Dialog.Close>
                        </div>
                      </Dialog.Content>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={() => handleRemoveItem(item.id)}>
                      <X size={14} />
                    </Button>
                  </div>
                </td>
              </>
            )}
          />
        </div>
      </div>
      <aside className="w-[250px] px-4">
        <div className="flex justify-between gap-x-2">
          <h2 className="font-medium text-lg mb-3">Order Summary</h2>
          <div>
            <Button
              disabled={!data?.items?.length}
              variant="danger"
              size="icon"
              title="Remove Order"
              onClick={handleClearCart}
            >
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
                if (floatValue && floatValue > -1) {
                  setAmount(floatValue)
                }
              }}
              value={amount}
              customInput={Input}
              thousandSeparator
              className="text-right"
            />
          </div>

          <div className="mb-3">
            <dl className="flex justify-between gap-x-2">
              <dt>Change Due:</dt>
              <dd>
                <Price value={amount * 100 - data?.total} />
              </dd>
            </dl>
          </div>
        </div>

        <div className="">
          {mutationPlaceOrder.error && (
            <Alert className="my-3" variant="danger">
              {mutationPlaceOrder.error.message}
            </Alert>
          )}
          <Button full onClick={handlePlaceOrder} disabled={!data?.items?.length}>
            Place an Order
          </Button>
        </div>
      </aside>
    </div>
  )
}
