import { useQuery, UseQueryResult } from "@tanstack/react-query";

import type { ReturnType } from '../utils/type'


type Params = {
  userId?: number
  pageSize: number
  searchTerm: string
  cursorIdParam: string | null
  direction: string | null
  onHasLastItem: (v: boolean) => void
}


export default function useProductsFetch({ userId, pageSize, searchTerm, cursorIdParam, direction, onHasLastItem }: Params): UseQueryResult<ReturnType> {
  return useQuery({
    queryKey: ['products', { search: searchTerm }, cursorIdParam, direction],
    queryFn: async (searchTerm) => {
      console.log({ searchTerm })
      if (!userId) {
        throw new Error('User not found')
      }

      const term = searchTerm?.queryKey?.[1]?.search


      console.log({ term })

      if (term) {
        const { data } = await window.apiProduct.searchProduct(String(term))
        return data
      }

      const cursorId = cursorIdParam ? Number(cursorIdParam) : 0

      direction = direction ?? 'next'

      const { data, error } = await window.apiProduct.getAllProducts({
        pageSize,
        cursorId: cursorId,
        userId: Number(userId),
        direction: direction as 'prev' | 'next'
      })

      if (error instanceof Error) {
        throw new Error(error.message)
      }

      if (!data) {
        return null
      }
      onHasLastItem(false)

      if (data.length > pageSize) {
        onHasLastItem(true)
        data.pop()
      }

      return direction == 'next' ? data : data?.toReversed()
    }
  })

}
