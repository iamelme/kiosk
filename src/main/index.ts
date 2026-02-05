import fs from 'fs'
import { app, shell, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { AppDatabase } from '../renderer/src/database/db'
import { CategoryRepository } from '../renderer/src/repository/CategoryRepository'
import { ProductRepository } from '../renderer/src/repository/ProductRepository'
import { InventoryRepository } from '../renderer/src/repository/InventoryRepository'
import { UserRepository } from '../renderer/src/repository/UserRepository'
import { CartRepository } from '../renderer/src/repository/CartRepository'
import { SaleRepository } from '../renderer/src/repository/SaleRepository'
import { SettingsRepository } from '../renderer/src/repository/SettingsRepository'
import createPDF from './createInvoicePDF'
import { ReturnSaleType } from '../renderer/src/utils/types'

export let db

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const protocolName = 'elme-cute'
protocol.registerSchemesAsPrivileged([{ scheme: protocolName, privileges: { bypassCSP: true } }])

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  // protocol.handle(protocolName, (request: Request) => {
  protocol.handle(protocolName, (request: Request) => {
    // const userDataPath = app.getPath('userData')
    // return net.fetch(`${protocolName}://${userDataPath}`)

    const url = request.url.replace(`${protocolName}://`, 'file://')
    return net.fetch(url)

    // const filePath = request.url.slice(`${protocolName}://`.length)
    // Serve a file from your application directory
    // return net.fetch(url.pathToFileURL(path.resolve(__dirname, filePath)).toString())
  })

  electronApp.setAppUserModelId('com.electron')

  db = new AppDatabase()

  new CategoryRepository(db.db)
  new ProductRepository(db.db)
  const inventory = new InventoryRepository(db.db)
  new UserRepository(db.db)
  new CartRepository(db.db)
  new SaleRepository(db.db, inventory)
  new SettingsRepository(db.db)

  // console.log('db from main', db)

  // const locale = app.getLocale()
  // console.log('Current application locale:', locale)

  ipcMain.handle('get-locale', () => {
    return app.getLocale()
  })

  ipcMain.handle('create-pdf', (_, params: ReturnSaleType & { logo: string }) => {
    return createPDF(params)
  })

  ipcMain.handle('upload-logo', async () => {
    const userDataPath = app.getPath('userData')
    const imagePath = join(userDataPath, './assets/images')
    if (!fs.existsSync(imagePath)) {
      fs.mkdirSync(imagePath, { recursive: true })
    }

    const res = await dialog.showOpenDialog({
      properties: ['openFile']
    })

    if (!res.canceled && res.filePaths.length > 0) {
      const filePath = res.filePaths[0]
      const stats = fs.statSync(filePath)
      // const fileContent = fs.readFileSync(filePath)
      console.log('stats', stats)

      const destPath = join(userDataPath, `./assets/images/logo.webp`)
      fs.copyFile(filePath, destPath, (err) => {
        if (err) {
          console.error('Save failed:', err)
          throw new Error(err.message)
        }
        console.log('File saved successfully at:', destPath)
      })

      return destPath
    }
    throw new Error('Something went wrong while uploading the logo')
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
