import { ISettingRepository } from '@renderer/interfaces/ISettingRepository'
import { ipcMain } from 'electron'

export class SettingsRepository implements ISettingRepository {
  private _database

  constructor(database) {
    this._database = database

    ipcMain.handle('settings:get', () => this.get())
    ipcMain.handle('settings:updateLocale', (_, locale: string) => this.updateLocale(locale))
    ipcMain.handle('settings:uploadLogo', (_, logo: string) => this.uploadLogo(logo))
  }

  get(): {
    data: { locale: string; logo: string; tax: number } | null
    error: Error | string
  } {
    try {
      const settings = this._database.prepare(`SELECT * FROM settings`).get()
      return {
        data: settings,
        error: ''
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while retrieving the product')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while  retrieving the product')
      }
    }
  }
  updateLocale(locale: string): {
    success: boolean
    error: Error | string
  } {
    try {
      this._database
        .prepare(
          `
            UPDATE 
            FROM settings 
            SET locale = ?
            `
        )
        .run(locale)
      return {
        success: true,
        error: ''
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: new Error('Something went wrong while saving the locale')
        }
      }
      return {
        success: false,
        error: new Error('Something went wrong while saving the locale')
      }
    }
  }

  uploadLogo(path: string): {
    data: string
    error: Error | string
  } {
    try {
      console.log('here upload')

      this._database
        .prepare(
          `
            UPDATE settings 
            SET logo = ?
            `
        )
        .run(path)

      const res = this.get()
      if (res.data) {
        return {
          data: res.data.logo,
          error: ''
        }
      }
      throw new Error('')
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: '',
          error: new Error('Something went wrong while saving the logo')
        }
      }
      return {
        data: '',
        error: new Error('Something went wrong while saving the logo')
      }
    }
  }
}
