import { CategoryType } from '@renderer/utils/types'

export type ReturnType = {
  data: CategoryType | null
  error: Error | string
}

export interface ICategoryRepository {
  getAll(): CategoryType[]
  getById(id: number): CategoryType
  getByName(name: string): ReturnType
  create(name: string): ReturnType
  update({ id, name }: { id: number; name: string }): ReturnType
  delete(id: number): { success: boolean; error: Error | string }
}
