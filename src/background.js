'use strict'

import { app, protocol, BrowserWindow, shell, ipcMain, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

let getMp3Dir = '/mp3'
if (isDevelopment) {
    getMp3Dir = '/../public/mp3'
}

ipcMain.on('player-files-folder', (event, arg) => {
    shell.openPath(app.getAppPath() + getMp3Dir + '/player')
})

ipcMain.on('close-app', (event, arg) => {
    app.exit(0)
})




// main
ipcMain.on('show-context-menu', (event) => {
    const template = [{
            label: 'Refresh',
            click: () => { event.sender.send('context-menu-command', 'refresh') }
        },
        {
            label: 'Mute / UnMute',
            click: () => { event.sender.send('context-menu-command', 'mute') },
        },
        { type: 'separator' },
        {
            label: 'Open Main Player Folder',
            click: () => { shell.openPath(app.getAppPath() + getMp3Dir + '/player') }
        },
        {
            label: 'Open Azan Folder',
            click: () => { shell.openPath(app.getAppPath() + getMp3Dir + '/azan') }
        },
        {
            label: 'Open Zikr Folder',
            click: () => { shell.openPath(app.getAppPath() + getMp3Dir + '/zikr') }
        },
        {
            label: 'Open MP3 Folder',
            click: () => { shell.openPath(app.getAppPath() + getMp3Dir + '') }
        },
        { type: 'separator' },
        {
            label: 'Exit',
            click: () => { app.exit(0) }
        },
        { type: 'separator' },
        {
            label: 'Version: 1.0',
            click: () => {
                // win.webContents.openDevTools()
                shell.openExternal('https://www.rwangroup.com/')
            }
        },
    ]

    const menu = Menu.buildFromTemplate(template)
    menu.popup(BrowserWindow.fromWebContents(event.sender))
})

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])


async function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        icon: 'favicon.ico',
        autoHideMenuBar: true,
        frame: false,
        maximizable: false,
        resizable: false,
        width: 533,
        height: 750,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
        }
    })


    // win.webContents.openDevTools()
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
            // if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
            // Load the index.html when not in development
            // win.loadURL('app://./index.html')
        win.loadURL(`file://${process.cwd()}/resources/app/index.html`);

    }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async() => {

    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()


})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}