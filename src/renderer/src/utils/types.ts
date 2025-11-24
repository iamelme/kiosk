export type CategoryType = {
  id: number
  name: string
}

export type ProductType = {
  id: number
  name: string
  description?: string
  price: number
  quantity: number
  code: number
  category_id: number
}
