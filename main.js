// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
let myWindow = null;

// Restricts user to one instance of Kive
const gotTheLock = app.requestSingleInstanceLock();

//var appDataPath = app.getPath('appData');

const appDataPath = app.getPath('appData').split("\\").join("/") + "/kive_data";
global.sharedObject = {
  appDataPath: appDataPath
}




const path = require("path");

/*************************************************************
 * py process
 *************************************************************/

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
    if (process.platform === 'win32') {
      console.log("Packaged: windows");
      serverProc = require('child_process').execFile(path.join(__dirname, BACKEND_FOLDER, BACKEND_DIST_FOLDER, SERVER_MODULE + '.exe'), [appDataPath, port]);
    }
    else {
      serverProc = require('child_process').execFile(path.join(__dirname, BACKEND_FOLDER, BACKEND_DIST_FOLDER, SERVER_MODULE), [appDataPath, port]);
    }
  }
  // Else, run python script
  else {
    serverProc = require('child_process').spawn('python', [path.join(__dirname, BACKEND_FOLDER, SERVER_MODULE + '.py'), appDataPath, port]);
  }
  // Log success/failure
  if (serverProc != null) {
    console.log('Started Server on port ' + port);
  }
  else {
    console.log('SERVER FAILED');
  }
}

// Kills server
const killServer = () => {
  serverProc.kill()
  serverProc = null
  //serverPort = null
}

app.on('ready', () => startServer(serverPort));
app.on('will-quit', killServer);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

    // Create the browser window.
    myWindow = new BrowserWindow({
      width: 1035,
      height: 1000,
      webPreferences: {
        nodeIntegration: true
      }
    })

    //myWindow.on('close', function() {
    //myWindow.webContents.executeJavaScript("const { shutdown } = require('./app/js/communication_layer.js'); shutdown();");
    //});

    //myWindow.webContents.on('did-finish-load', function() {
    //myWindow.webContents.executeJavaScript("localStorage.setItem('path', '" + app.getPath('appData').split("\\").join( "/") + "');");
    //myWindow.webContents.executeJavaScript("const { shutdown } = require('./app/js/communication_layer.js'); shutdown();");
    //});

    // and load the index.html of the app.
    myWindow.loadFile('index.html')
  });

  //app.on('will-quit', (event) => {

  //});

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // TODO: add closing/backup functionality when closed properly
    // DOESNT WORK RIGHT NOW

    //myWindow.webContents.executeJavaScript("const { shutdown } = require('./app/js/communication_layer.js'); shutdown();");

    app.quit();
  });
}
