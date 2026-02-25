import { useMutation, UseMutationResult } from "@tanstack/react-query"
import { NavigateFunction } from "react-router-dom"
import { UserType } from "src/renderer/src/shared/utils/types"

type Params = {
  onUpdateUser: (user: UserType) => void
  navigate: NavigateFunction
}

export default function useLogin({ onUpdateUser, navigate }: Params): UseMutationResult<void, Error, UserType, unknown> {


  return useMutation({
    mutationFn: async (data: UserType): Promise<void> => {
      const { data: user, error } = await window.apiUser.login(data)
      if (error instanceof Error) {
        throw new Error(error.message)
      }

      if (user) {
        onUpdateUser(user)
      }
    },
    onSuccess: () => {
      navigate('/')
    }
  })
}
