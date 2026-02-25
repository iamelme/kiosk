import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { NavigateFunction } from "react-router-dom";
import { CategoryType } from "../../../shared/utils/types";


type Params = {
  id?: string
  onNavigate: NavigateFunction
  onInvalidate: Promise<void>
}

export default function useSubmit({ id, onNavigate, onInvalidate }: Params): UseMutationResult<void, Error, CategoryType, unknown> {

  return useMutation({
    mutationFn: async (data: CategoryType): Promise<void> => {

      if (id !== 'new') {
        const { error } = await window.apiCategory.updateCategory({
          id: Number(id),
          name: data.name
        })

        if (error instanceof Error) {
          throw new Error(error.message)
        }

        onNavigate(-1)
        return
      }

      const { error } = await window.apiCategory.createCategory(data.name)

      if (error && error instanceof Error) {
        throw new Error(error.message)
      }

      onNavigate(-1)
    },
    onSuccess: () => {
      onInvalidate
      // queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}
