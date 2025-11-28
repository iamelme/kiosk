import { CategoryType } from '@renderer/utils/types'

export interface ICategoryRepository {
  getAll(): CategoryType[]
  get(id: number): CategoryType
  create(name: string): {
    success: boolean
    error: string
  }
  update({ id, name }: { id: number; name: string }): {
    success: boolean
    error: string
  }
}
