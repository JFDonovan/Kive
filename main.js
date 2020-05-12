// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
let myWindow = null;

// Restricts user to one instance of Kive
const gotTheLock = app.requestSingleInstanceLock();

// Sets app data path and platform as global variables
const appDataPath = app.getPath('appData').split("\\").join("/") + "/kive_data";
const platform = process.platform = process.platform
global.sharedObject = {
  appDataPath: appDataPath,
  platform: platform
}


/*** ----------------------- Backend Server ------------------------- ***/

const path = require("path");

// Path to backend folder
const BACKEND_FOLDER = 'app/backend';
// Dist folder within backend folder
const BACKEND_DIST_FOLDER = 'dist';
// Server script name
const SERVER_MODULE = 'server';

let serverProc = null;
let serverPort = 5000;

// Checks if packaged by looking for "dist" folder
const packaged = () => {
  return require('fs').existsSync(path.join(__dirname, BACKEND_FOLDER, BACKEND_DIST_FOLDER));
}

// Starts the Server on given port number
const startServer = (port_num) => {
  let checkPackaged = packaged()
  let port = port_num;//port_num;

  // If packaged, run executable
  if (checkPackaged) {
    if (platform === 'win32') {
      console.log("Packaged: windows");
      serverProc = require('child_process').execFile(path.join(__dirname, BACKEND_FOLDER, BACKEND_DIST_FOLDER, SERVER_MODULE + '.exe'), [port, appDataPath, platform]);
    }
    else {
      console.log("Packaged: not windows");
      serverProc = require('child_process').execFile(path.join(__dirname, BACKEND_FOLDER, BACKEND_DIST_FOLDER, SERVER_MODULE), [port, appDataPath, platform]);
    }
  }
  // Else, run python script
  else {
    console.log("Not packaged");
    serverProc = require('child_process').spawn('python', [path.join(__dirname, BACKEND_FOLDER, SERVER_MODULE + '.py'), port, appDataPath, platform]);
  }
  // Log success/failure
  if (serverProc != null) {
    console.log('Started Server on port ' + port);
  }
  else {
    console.log('SERVER FAILED');
  }
}

const killProcesses = () => {
  // Shut down server
  console.log("killProcesses called");
  if (serverProc != null) {
    const https = require('http')
    const options = {
      hostname: 'localhost',
      port: serverPort,
      path: '/shutdown',
      method: 'GET'
    }
    const req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);
      res.on('data', d => {
        console.log(d);
        serverProc = null;
        app.quit();
      });
    });
    req.on('error', error => {
      console.error(error)
      serverProc = null;
      app.quit();
    });

    req.end()
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if (!gotTheLock) {
  app.quit()
}
else {
  app.on('second-instance', _ => {
    // Someone tried to run a second instance, we should focus our window.
    if (myWindow) {
      if (myWindow.isMinimized()) myWindow.restore()
      myWindow.focus()
    }
  })

  // Create myWindow, load the rest of the app, etc...
  app.on('ready', () => {

    // Starts server
    startServer(serverPort)

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
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // TODO: add closing/backup functionality when closed properly
    killProcesses();
    //app.quit();
  });

  app.on('before-quit', (e) => {
    killProcesses();
  });
}
