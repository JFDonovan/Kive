// Set listeners for import options
document.getElementById("file_import_btn").onclick = function () {
  get_file();
}
document.getElementById("folder_import_btn").onclick = function () {
  get_folder("folder", null);
}
document.getElementById("wsb_import_btn").onclick = function () {
  get_folder("wsb", null);
}
document.getElementById("sb_import_btn").onclick = function () {
  get_folder("sb", null);
}

// Retrieve selected folder
function get_folder(importType, nodeId) {
  console.log('get_folder called');
  let remote = require('electron').remote;
  let dialog = remote.dialog;

  dialog.showOpenDialog({
    title: "Select a folder",
    properties: ["openDirectory"]
  }).then(folderPaths => {
    // folderPaths is an array that contains all the selected paths
    if (folderPaths.filePaths === undefined || folderPaths.filePaths == "") {
      console.log("No destination folder selected");
      return;
    }
    else {
      // Formats command based on import type
      let toBackend = "BAD COMMAND";

      if (importType === "folder") {
        toBackend = ("import-folder:*:" + folderPaths.filePaths + ":*:" + currentWorkspace);
      }
      else if (importType == "wsb") {
        toBackend = ("import-wsb:*:" + folderPaths.filePaths + ":*:" + currentWorkspace);
      }
      else {
        toBackend = ("import-sb:*:" + folderPaths.filePaths + ":*:" + currentWorkspace);
      }
      // Sends import command, path of selected folder, and current workspace to backend
      addWork(toBackend, nodeId, currentWorkspace);
    }
  });
}

// Retrieve selected file
function get_file(node) {
  console.log('get_file called');
  let remote = require('electron').remote;
  let dialog = remote.dialog;

  dialog.showOpenDialog({
    title: "Select a file",
    properties: ['openFile'],
    filters: [{
      name: 'Entries',
      extensions: ['htm', 'html']
    }]
  }).then(folderPaths => {
    // folderPaths is an array that contains all the selected paths
    if (folderPaths.filePaths === undefined  || folderPaths.filePaths == "") {
      console.log("No destination folder selected");
      return;
    }
    else {
      let toBackend = ("import-file:*:" + folderPaths.filePaths + ":*:" + currentWorkspace);
      // Sends import command, path of selected file, and current workspace to backend
      addWork(toBackend, node, currentWorkspace);
    }
  });
}
