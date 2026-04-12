import path from 'node:path';

import { app, BrowserWindow, ipcMain } from 'electron';

import { loadSessionDetail, loadSessionSummaries, getEnvironmentInfo, getSessionSummary } from './session-service';
import { openSessionInTerminal } from './terminal-launcher';

const isDevelopment = Boolean(process.env.VITE_DEV_SERVER_URL);

function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1480,
    height: 960,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#0d1113',
    title: 'Codex Session Manager',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  if (isDevelopment) {
    mainWindow.setMenuBarVisibility(false);
  }

  return mainWindow;
}

app.whenReady().then(() => {
  app.setName('Codex Session Manager');
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('sessions:list', async () => loadSessionSummaries());
ipcMain.handle('sessions:detail', async (_event, sessionId: string) => loadSessionDetail(sessionId));
ipcMain.handle('sessions:environment', async () => getEnvironmentInfo());
ipcMain.handle('sessions:resume', async (_event, sessionId: string) => {
  const summary = await getSessionSummary(sessionId);
  await openSessionInTerminal({
    cwd: summary?.cwd,
    sessionId,
  });

  return {
    ok: true,
    message: `Opened Codex session ${sessionId.slice(0, 8)} in a new terminal window.`,
  };
});
