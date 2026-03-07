import { Database } from "better-sqlite3";
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { join } from "path";

export function addBackUp(db: Database) {
  ipcMain.handle("save-db", async (_) => {
    const date = new Date();
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      const { canceled, filePath } = await dialog.showSaveDialog(win, {
        title: "Select a location to save your database backup",
        defaultPath: join(
          app.getPath("downloads"),
          `baligya_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
        ),
        buttonLabel: "Save",
      });

      if (canceled) {
        return;
      }

      try {
        db.exec(`
                  PRAGMA journal_mode=WAL;
                  VACUUM INTO '${filePath}.db';
                  `);

        db.prepare("INSERT INTO backup_logs (filename) VALUES (?)").run(
          `${filePath}.db`,
        );
      } catch (error) {
        if (error instanceof Error) {
          dialog.showErrorBox("Save Failed", error.message);
        }
      }
    }
  });
}
