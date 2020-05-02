// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
let myWindow = null

// Restricts user to one instance of Kive
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', _ => {
    // Someone tried to run a second instance, we should focus our window.
    if (myWindow) {
      if (myWindow.isMinimized()) myWindow.restore()
      myWindow.focus()
    }
  })

  // Create myWindow, load the rest of the app, etc...
  app.on('ready', () => {


    // Create the browser window.
    myWindow = new BrowserWindow({
      width: 1035,
      height: 1000,
      webPreferences: {
        nodeIntegration: true
      }
    })

    // and load the index.html of the app.
    myWindow.loadFile('index.html')
  })

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // TODO: add closing/backup functionality when closed properly
    // DOESNT WORK RIGHT NOW
    const { shutdown } = require('./app/js/server');
    shutdown();

    app.quit();
  })
}
