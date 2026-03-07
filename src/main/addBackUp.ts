import Database, { type Database as DatabaseType } from "better-sqlite3";
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { join } from "path";

export function addBackUp(db: DatabaseType) {
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
        db.pragma("journal_mode = WAL");
        db.exec(`VACUUM INTO '${filePath}.db';`);

        const newDb = new Database(`${filePath}.db`);

        const result = newDb.pragma("integrity_check", {
          simple: true,
        });

        console.log("result", result);

        if (result === "ok") {
          console.log("Database integrity is healthy.");
        } else {
          console.error("Database corruption detected:");
        }

        db.prepare(
          "INSERT INTO backup_logs (created_at, filename, status) VALUES (?, ?, ?)",
        ).run(new Date().toISOString(), `${filePath}.db`, result);
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          dialog.showErrorBox("Save Failed", error.message);
        }
      }
    }
  });
}
