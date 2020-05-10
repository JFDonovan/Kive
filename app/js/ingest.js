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
      importingOverlay();
      // send import command to backend with filepath, import type, and current workspace
      getRequest("import/" + encodeURIComponent(folderPaths.filePaths) + "/" + importType + "/" + currentWorkspace, nodeId);
    }
  });
}

// Retrieve selected file
function get_file(nodeId) {
  console.log('get_file called');

  dialog.showOpenDialog({
    title: "Select a file",
    properties: ['openFile'],
    filters: [{
      name: 'Entries',
      extensions: ['htm', 'html']
    }]
  }).then(folderPaths => {
    // folderPaths is an array that contains all the selected paths
    if (folderPaths.filePaths === undefined || folderPaths.filePaths == "") {
      console.log("No destination folder selected");
      return;
    }
    else {
      importingOverlay();
      // send import command to backend with filepath, import type (file), and current workspace
      getRequest("import/" + encodeURIComponent(folderPaths.filePaths) + "/file/" + currentWorkspace, nodeId);
    }
  });
}
