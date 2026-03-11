import { SettingsType } from "../../renderer/src/features/settings/utils/type";

export type ReturnBackuplog = {
  data: { created_at: string; status?: string } | null;
  error: Error | string;
};

export interface ISettingRepository {
  get: () => { data: SettingsType | null; error: Error | string };
  getBackuplog: () => ReturnBackuplog;
  updateLocale: (locale: string) => { success: boolean; error: Error | string };
  uploadLogo: (path: string) => { data: string; error: Error | string };
  update: (params: Partial<SettingsType>) => {
    success: boolean;
    error: Error | string;
  };
}
