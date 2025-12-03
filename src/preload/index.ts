import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { CategoryType, ProductType } from '../renderer/src/utils/types'

// Custom APIs for renderer
export const apiCategory = {
  getAllCategories: (): Promise<CategoryType[]> => ipcRenderer.invoke('category:getAll'),
  getCategory: (id: number): Promise<CategoryType> => ipcRenderer.invoke('category:get', id),
  createCategory: (name: string): Promise<{ success: boolean; error: string }> =>
    ipcRenderer.invoke('category:create', name),
  updateCategory: ({
    id,
    name
  }: {
    id: number
    name: string
  }): Promise<{ success: boolean; error: string }> =>
    ipcRenderer.invoke('category:update', { id, name })
}

export const apiProduct = {
  getAllProducts: (): Promise<Array<ProductType & { category_name: string }>> =>
    ipcRenderer.invoke('product:getAll'),
  getProductById: (id: number): Promise<ProductType> => ipcRenderer.invoke('product:getById', id),
  getProductByCode: (code: number): Promise<{ data: ProductType | null; error: Error | string }> =>
    ipcRenderer.invoke('product:getByCode', code),
  getProductBySku: (sku: string): Promise<{ data: ProductType | null; error: Error | string }> =>
    ipcRenderer.invoke('product:getBySku', sku),
  getProductByName: (name: string): Promise<{ data: ProductType | null; error: Error | string }> =>
    ipcRenderer.invoke('product:getByName', name),
  createProduct: (params: Omit<ProductType, 'id'>) => ipcRenderer.invoke('product:create', params),
  updateProduct: (params: ProductType) => ipcRenderer.invoke('product:update', params),
  deleteProduct: (id: number): Promise<{ success: boolean; error: Error | string }> =>
    ipcRenderer.invoke('product:delete', id)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('apiCategory', apiCategory)
    contextBridge.exposeInMainWorld('apiProduct', apiProduct)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
