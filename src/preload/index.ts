import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  CategoryType,
  ErrorType,
  InventoryType,
  ProductType,
  ReturnCartType,
  UserType,
  ReturnSaleType,
  PlaceOrderType,
  SaleType,
  ReturnType,
  ReturnItemType
} from '../renderer/src/utils/types'

type SettingsType = {
  locale: string
  logo: string
  tax: number
}

type ProdInventoryType = {
  id: number
  quantity: number
  product_id: number
  product_name: string
  product_sku: string
}

type CategoryReturnType = {
  data: CategoryType | null
  error: ErrorType
}

type CartReturnType = {
  data: ReturnCartType | null
  error: ErrorType
}

type SaleReturnType = {
  data: ReturnSaleType | null
  error: ErrorType
}

type SaleItem = {
  sale_id: number
  product_id: number
  user_id: number
}

type CartItem = {
  cart_id: number
  product_id: number
  user_id: number
}
export const apiUser = {
  create: (params: UserType): Promise<{ data: UserType | null; error: ErrorType }> =>
    ipcRenderer.invoke('user:create', params),
  login: (params: UserType): Promise<{ data: UserType | null; error: ErrorType }> =>
    ipcRenderer.invoke('user:login', params)
}

export const apiCart = {
  getByUserId: (id: number): Promise<CartReturnType> => ipcRenderer.invoke('cart:getByUserId', id),
  updateDiscount: (params: {
    discount: number
    total: number
    cart_id: number
  }): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('cart:updateDiscount', params),
  updateItemQty: (params: {
    id: number
    cart_id: number
    quantity: number
  }): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('cart:updateItemQty', params),
  insertItem: (params: CartItem): Promise<CartReturnType> =>
    ipcRenderer.invoke('cart:insertItem', params),
  removeItem: (id: number, cart_id: number): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('cart:removeItem', id, cart_id),
  deleteAllItems: (cart_id: number): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('cart:deleteAllItems', cart_id)
}

export const apiSale = {
  getAll: (params: {
    pageSize: number
    cursorId: number
    userId: number
    direction?: 'prev' | 'next'
  }): Promise<{ data: SaleType[] | null; error: ErrorType }> =>
    ipcRenderer.invoke('sale:getAll', params),
  getByUserId: (id: number): Promise<SaleReturnType> => ipcRenderer.invoke('sale:getByUserId', id),
  getById: (id: number): Promise<SaleReturnType> => ipcRenderer.invoke('sale:getById', id),
  getRevenue: (params: {
    startDate: string
    endDate: string
  }): Promise<{
    data: { gross_revenue: number; total_return: number; net_revenue: number } | null
    error: ErrorType
  }> => ipcRenderer.invoke('sale:getRevenue', params),
  getTopItems: (params: {
    pageSize: number
    cursorId: number
    lastTotal: number
    direction?: 'prev' | 'next'
    startDate: string
    endDate: string
  }): Promise<{
    data: Array<Pick<ProductType, 'id' | 'name'> & { net_quantity_sold: number }> | null
    error: ErrorType
  }> => ipcRenderer.invoke('sale:getTopItems', params),
  placeOrder: (params: PlaceOrderType): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('sale:placeOrder', params),
  insertItem: (params: SaleItem): Promise<SaleReturnType> =>
    ipcRenderer.invoke('sale:insertItem', params),
  updateSaleStatus: (params: {
    id: number
    status: string
  }): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('sale:updateStatus', params),
  deleteAllItems: (saleId: number): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('sale:deleteAllItems', saleId)
}

export const apiReturn = {
  create: (
    params: Omit<ReturnType, 'id' | 'created_at' | 'items'> & {
      items: Array<Omit<ReturnItemType, 'id' | 'created_at' | 'return_id'>>
    }
  ): Promise<{ data: null; error: ErrorType }> => ipcRenderer.invoke('return:create', params)
}

// Custom APIs for renderer
export const apiCategory = {
  getAllCategories: (): Promise<{ data: CategoryType[]; error: ErrorType }> =>
    ipcRenderer.invoke('category:getAll'),
  getCategoryById: (id: number): Promise<CategoryReturnType> =>
    ipcRenderer.invoke('category:getById', id),
  getCategoryByName: (name: string): Promise<CategoryReturnType> =>
    ipcRenderer.invoke('category:getByName', name),
  createCategory: (name: string): Promise<CategoryReturnType> =>
    ipcRenderer.invoke('category:create', name),
  updateCategory: ({ id, name }: { id: number; name: string }): Promise<CategoryReturnType> =>
    ipcRenderer.invoke('category:update', { id, name }),
  deleteCategory: (id: number): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('category:delete', id)
}

export const apiProduct = {
  getAllProducts: (params: {
    pageSize: number
    cursorId: number
    userId: number
    direction?: 'prev' | 'next'
  }): Promise<{
    data: Array<ProductType & { quantity: number; category_name: string }> | null
    error: ErrorType
  }> => ipcRenderer.invoke('product:getAll', params),
  getProductById: (id: number): Promise<{ data: ProductType; error: ErrorType }> =>
    ipcRenderer.invoke('product:getById', id),
  getProductByCode: (code: number): Promise<{ data: ProductType | null; error: ErrorType }> =>
    ipcRenderer.invoke('product:getByCode', code),
  getProductBySku: (sku: string): Promise<{ data: ProductType | null; error: ErrorType }> =>
    ipcRenderer.invoke('product:getBySku', sku),
  getProductByName: (name: string): Promise<{ data: ProductType | null; error: ErrorType }> =>
    ipcRenderer.invoke('product:getByName', name),
  searchProduct: (
    term: string
  ): Promise<{
    data: Array<ProductType & { quantity: number; category_name: string }> | null
    error: ErrorType
  }> => ipcRenderer.invoke('product:search', term),
  createProduct: (params: Omit<ProductType, 'id'>) => ipcRenderer.invoke('product:create', params),
  updateProduct: (params: ProductType) => ipcRenderer.invoke('product:update', params),
  deleteProduct: (id: number): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('product:delete', id)
}

export const apiInventory = {
  getAllInventory: (params: {
    pageSize: number
    cursorId: number
    direction?: 'prev' | 'next'
  }): Promise<{
    data: Array<ProductType & InventoryType>
    error: ErrorType
  }> => ipcRenderer.invoke('inventory:getAll', params),
  getInventoryById: (id: number): Promise<{ data: ProdInventoryType | null; error: ErrorType }> =>
    ipcRenderer.invoke('inventory:getById', id),
  createInventory: (params: InventoryType): Promise<{ data: InventoryType; error: ErrorType }> =>
    ipcRenderer.invoke('inventory:create', params),
  updateInventory: (params: InventoryType): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('inventory:update', params),
  deleteInventory: (id: number): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('inventory:delete', id)
}

export const apiSettings = {
  getSettings: (): Promise<{ data: SettingsType; error: ErrorType }> =>
    ipcRenderer.invoke('settings:get'),
  updateLocale: (locale: string): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('settings:updateLocale', locale),
  uploadLogo: (logo: string): Promise<{ data: string; error: ErrorType }> =>
    ipcRenderer.invoke('settings:uploadLogo', logo)
}

export const apiElectron = {
  getLocale: (): Promise<string> => ipcRenderer.invoke('get-locale'),
  createPDF: (params: ReturnSaleType & { logo: string }): Promise<ArrayBuffer> =>
    ipcRenderer.invoke('create-pdf', params),
  uploadLogo: (): Promise<string | null> => ipcRenderer.invoke('upload-logo')
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('apiCart', apiCart)
    contextBridge.exposeInMainWorld('apiSale', apiSale)
    contextBridge.exposeInMainWorld('apiReturn', apiReturn)
    contextBridge.exposeInMainWorld('apiUser', apiUser)
    contextBridge.exposeInMainWorld('apiCategory', apiCategory)
    contextBridge.exposeInMainWorld('apiProduct', apiProduct)
    contextBridge.exposeInMainWorld('apiInventory', apiInventory)
    contextBridge.exposeInMainWorld('apiSettings', apiSettings)
    contextBridge.exposeInMainWorld('apiElectron', apiElectron)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
