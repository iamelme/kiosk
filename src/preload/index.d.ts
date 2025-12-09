import { ElectronAPI } from '@electron-toolkit/preload'
import { apiUser, apiCategory, apiElectron, apiInventory, apiProduct } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    apiUser: typeof apiUser
    apiCategory: typeof apiCategory
    apiProduct: typeof apiProduct
    apiInventory: typeof apiInventory
    apiElectron: typeof apiElectron
  }
}
