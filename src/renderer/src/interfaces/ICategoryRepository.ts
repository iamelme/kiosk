import { CategoryType } from '@renderer/utils/types'

export interface ICategoryRepository {
  getAll(): CategoryType[]
  get(id: number): CategoryType
  create(name: string): void
  update({ id, name }: { id: number; name: string }): void
}
