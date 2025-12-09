export type UserType = {
  id: number
  user_name: string
  password: string
}

export type CategoryType = {
  id: number
  name: string
}

export type ProductType = {
  id: number
  name: string
  sku: string
  description?: string
  price: number
  code: number
  category_id: number
}

export type InventoryType = {
  id: number
  quantity: number
  product_id: number
}

export type ErrorType = Error | string
