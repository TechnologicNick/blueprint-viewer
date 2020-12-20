const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const BlueprintManager = require("./blueprintManager.js");
const WorkshopModManager = require("./workshopModManager.js");

// console.log(__dirname);
// require("electron-reload")(__dirname, {
//     electron: path.join(__dirname, "..", "node_modules", ".bin", "electron.cmd")
// });

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: { nodeIntegration: true }
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

    // Open the DevTools.
    mainWindow.webContents.openDevTools({mode: "detach", activate: false});
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on("loadBlueprintFromFile", (event, pathDir) => {
    event.returnValue = BlueprintManager.fromDirectory(pathDir);
});

ipcMain.on("getShapesetDefinitions", (event, uuids) => {
    let jsons = {};

    for (let uuid of uuids) {
        let mods = WorkshopModManager.getModsWithShapeUuid(uuid);
        if (mods.length === 0) continue;

        let mod = mods[0]; //TODO: Multiple mods can use the same uuid

        jsons[uuid] = mod.shapes[uuid];
    }

    event.returnValue = jsons;
});

ipcMain.on("reloadMods", (event) => {
    // The returnValue has to be set, otherwise it'll hold up execution
    event.returnValue = WorkshopModManager.reloadMods();
});