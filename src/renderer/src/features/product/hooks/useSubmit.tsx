import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { ProductType } from "@renderer/shared/utils/types";
import { NavigateFunction } from "react-router-dom";

type Params = {
  id?: 'new' | string
  userId: number | null
  onNavigate: NavigateFunction
  onInvalidate: Promise<void>
}

export default function useSubmit({ id, userId, onNavigate, onInvalidate }: Params): UseMutationResult<void, Error, ProductType, unknown> {
  return useMutation({
    mutationFn: async (newData: ProductType): Promise<void> => {
      console.log('submit', newData)

      if (!userId) return;

      if (id !== 'new') {
        const { error } = await window.apiProduct.updateProduct({
          ...newData,
          id: Number(id),
          user_id: userId
        })
        if (error) {
          throw new Error(error.message)
        }
        onNavigate(-1)
        return
      }
      const { error } = await window.apiProduct.createProduct(newData)

      if (error) {
        throw new Error(error.message)
      }

      onNavigate(-1)
    },
    onSuccess: () => {
      onInvalidate
    }
  })


}
