import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { PlaceOrderType } from '@renderer/shared/utils/types'

type Props = {
  onRemoveCart?: () => void
}

export default function usePlaceOrder({
  onRemoveCart
}: Props): UseMutationResult<boolean, Error, PlaceOrderType, unknown> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PlaceOrderType) => {
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

      const { success, error } = await window.apiSale.placeOrder(payload)

      if (error instanceof Error) {
        throw new Error(error.message)
      }

      return success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      onRemoveCart?.()
    }
  })
}
