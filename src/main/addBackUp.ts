import { Database } from "better-sqlite3";
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { join } from "path";

export function addBackUp(db: Database) {
  ipcMain.handle("save-db", async (_) => {
    const date = new Date();
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      const { filePath } = await dialog.showSaveDialog(win, {
        title: "Select a location to save your database backup",
        defaultPath: join(
          app.getPath("downloads"),
          `baligya_${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`,
        ),
        buttonLabel: "Save",
      });

      // if (canceled) {
      //   return { status: "cancelled" };
      // }

      console.log({ filePath });

      try {
        db.exec(`
                  PRAGMA journal_mode=WAL;
                  VACUUM INTO '${filePath}.db';
                  `);
      } catch (error) {
        if (error instanceof Error) {
          dialog.showErrorBox("Save Failed", error.message);
        }
      }
    }
  });
}
