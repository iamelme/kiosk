import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { ProductType } from "src/renderer/src/shared/utils/types";

type Params = {
  id?: string
}

export default function useProductFetch({ id }: Params): UseQueryResult<ProductType> {
  return useQuery({
    queryKey: ['product', { id }],
    queryFn: async () => {
      if (!Number(id)) {
        throw new Error("Couldn't fetch this product")
      }

      const { data, error } = await window.apiProduct.getProductById(Number(id))

      if (error instanceof Error) {
        throw new Error(error.message)
      }

      return {
        ...data,
        price: data?.price / 100,
        cost: data?.cost / 100
      }

      // return {
      //   name: '',
      //   sku: '',
      //   description: '',
      //   price: 0,
      //   quantity: 1,
      //   code: 0,
      //   category_id: 0
      // }
    }

  })
}
