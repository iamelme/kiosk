type SettingsType = {
  locale: string
  logo: string
  tax: number
}

export interface ISettingRepository {
  get: () => { data: SettingsType | null; error: Error | string }
  updateLocale: (locale: string) => { success: boolean; error: Error | string }
  uploadLogo: (path: string) => { data: string; error: Error | string }
}
