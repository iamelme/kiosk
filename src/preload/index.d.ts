import { ElectronAPI } from '@electron-toolkit/preload'
import { apiCategory, apiElectron, apiInventory, apiProduct } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    apiCategory: typeof apiCategory
    apiProduct: typeof apiProduct
    apiInventory: typeof apiInventory
    apiElectron: typeof apiElectron
  }
}
