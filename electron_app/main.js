const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
  if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_START_URL) {
    win.loadURL(startUrl);
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(createWindow);