import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import fs from "fs";

export default function uploadLogo() {
  ipcMain.handle("upload-logo", async (event) => {
    const userDataPath = app.getPath("userData");
    const imagePath = join(userDataPath, "./assets/images");
    if (!fs.existsSync(imagePath)) {
      fs.mkdirSync(imagePath, { recursive: true });
    }

    const res = await dialog.showOpenDialog({
      filters: [{ name: "Images", extensions: ["jpg", "png"] }],
      properties: ["openFile"],
    });

    if (!res.canceled && res.filePaths.length > 0) {
      const filePath = res.filePaths[0];

      const destPath = join(userDataPath, `./assets/images/logo.webp`);
      fs.copyFile(filePath, destPath, (err) => {
        if (err) {
          console.error("Save failed:", err);
          throw new Error(err.message);
        }
        console.log("File saved successfully at:", destPath);

        const mainWindow = BrowserWindow.fromWebContents(event.sender);
        if (mainWindow) mainWindow.webContents.send("upload-complete");
      });

      return destPath;
    }
    throw new Error("Something went wrong while uploading the logo");
  });
}
