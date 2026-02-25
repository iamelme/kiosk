import { useQuery, UseQueryResult } from "@tanstack/react-query";
import type { ReturnType } from '../utils/type'

type Params = {
  searchTerm: string | null
}

export default function useProductSearch({ searchTerm }: Params): UseQueryResult<ReturnType> {
  return useQuery({
    queryKey: ['product', { search: searchTerm }],
    queryFn: async (searchTerm) => {
      const value = searchTerm.queryKey[1].search

      if (value) {
        const { data } = await window.apiProduct.searchProduct(String(value))

        return data
      }

      return null
    }
  })

}
