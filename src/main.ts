import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import {
  analyzeSong,
  readMetadata,
  writeMetadata,
  readAnalysisFromFile,
  writeAnalysisToFile,
  findAudioFiles,
  transformAnalysisToMetadata,
  hasBeenAnalyzed,
  expandPaths,
} from './services/musicTaggerService';
import { getSettings, setSettings } from './services/settingsService';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// IPC Handlers
ipcMain.handle('analyze-file', async (_, filePath: string, prompt?: string) => {
  return analyzeSong(filePath, prompt);
});

ipcMain.handle('read-tags', async (_, filePath: string) => {
  return readMetadata(filePath);
});

ipcMain.handle('has-been-analyzed', async (_, filePath: string) => {
  return hasBeenAnalyzed(filePath);
});

ipcMain.handle(
  'write-tags',
  async (_, filePath: string, metadata: unknown, mergeStrategy?: string) => {
    return writeMetadata(filePath, metadata, (mergeStrategy as any) ?? 'keep-existing');
  }
);

ipcMain.handle(
  'write-tags-from-analysis',
  async (
    _,
    filePath: string,
    analysis: unknown,
    mergeStrategy?: string,
    commentStrategy?: string
  ) => {
    const metadata = transformAnalysisToMetadata(analysis as any, (commentStrategy as any) ?? 'tags+summary');
    return writeMetadata(filePath, metadata, (mergeStrategy as any) ?? 'keep-existing');
  }
);

ipcMain.handle('read-analysis-from-file', async (_, filePath: string) => {
  return readAnalysisFromFile(filePath);
});

ipcMain.handle('write-analysis-to-file', async (_, filePath: string, analysis: unknown) => {
  return writeAnalysisToFile(filePath, analysis as any);
});

ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'Audio Files',
        extensions: ['mp3', 'flac', 'wav', 'm4a', 'aac', 'ogg', 'opus', 'wma', 'aiff', 'aif', 'm4p', 'mp4', '3gp'],
      },
    ],
  });
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return [];
  }
  return findAudioFiles(result.filePaths[0]);
});

ipcMain.handle('expand-paths', async (_, paths: string[]) => {
  return expandPaths(paths);
});

ipcMain.handle('get-settings', () => {
  return getSettings();
});

ipcMain.handle('set-settings', (_, settings: unknown) => {
  return setSettings(settings as any);
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 500,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open DevTools only in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
