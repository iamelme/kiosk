import { ErrorType, UserType } from '../shared/utils/types'

export type ReturnType = { data: UserType | null; error: ErrorType }

export interface IUserRepository {
  //   getAll(): UserType[]
  //   getById(id: number): UserType
  create(params: UserType): Promise<ReturnType>
  login(params: UserType): Promise<ReturnType>
  // delete(id: number)
}
