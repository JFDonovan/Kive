// ***** Global variable that stores currently viewed file
var open_file = null;

function connect_pyshell(toBackend, data) {
  // SENDING MESSAGE
  // sends message and forms connection to backend
  const { PythonShell } = require("python-shell");
  var path = require("path");
  // var toBackendSplit = toBackend.split(':*:')
  // var command = toBackendSplit[0]
  // var sendMsg = toBackendSplit.slice(1, toBackendSplit.length).join(':*:')

  var options = {
    scriptPath: path.join(__dirname, 'app/backend/'),
    // args: [command]
  }
  var command = toBackend.slice(0, toBackend.indexOf(':*:'))
  // Enable overlay when waiting for search results
  if (command == 'search') {
    enableSearchingOverlay();
  }

  var connection = new PythonShell('cmd_interpret.py', options)
  // connection.send(sendMsg)
  connection.send(toBackend)

  // RECIEVING MESSAGE
  // splits up response by delimiter and checks against response dict.
  connection.on('message', function (message) {

    //swal(message);
    console.log("From backend: " + message);
    // let respList = message.split(":*:");
    // let resp = respList[0];
    //swal(message)
    var firstDelimEnd = message.indexOf(':*:') // Marks the index after the first delimiter
    var resp = ""
    var args = []

    if (firstDelimEnd == -1) {
      resp = message
    } else {
      firstDelimEnd += 3
      resp = message.slice(0, firstDelimEnd - 3)
      var numArgs = 0
      switch (resp) {
        case "import-success":
        case "delete-workspace-success":
        case "search-success":
        case "index-success":
        case "update-success":
        case "delete-success":
          // console.log("Delete/Search Switch")
          numArgs = 1
          break
        case "create-workspace-success":
          // console.log("Import/Create Switch")
          numArgs = 2
          break
        default:
        // No args
      }
      // asgsadg:*:sgsgsad:*:sag
      console.log(resp)
      console.log("Num Args: " + numArgs)
      var prevDelimEnd = firstDelimEnd
      for (var i = 0; i < numArgs - 1; i++) {
        var curDelimEnd = message.indexOf(':*:', prevDelimEnd) + 3 // Marks the index after the current delimiter
        prevDelimEnd = curDelimEnd
      }

      console.log(firstDelimEnd)
      console.log(prevDelimEnd)
      if (prevDelimEnd == firstDelimEnd) {
        args = [message.slice(firstDelimEnd, message.length)]
      } else {
        args = message.slice(firstDelimEnd, prevDelimEnd - 3).split(":*:")
        args.push(message.slice(prevDelimEnd, message.length))
      }
    }
    console.log(args)
    let respDict = {
      "import-success": function () {
        appendTree(args[0], data);
        console.log("import successful");
      },
      "create-workspace-success": function () {
        workspaceHTML(args[0], args[1]);
        workspaceQueues[args[0]] = [];
        console.log("create workspace successful");
      },
      "delete-workspace-success": function () {
        deleteWorkspaceHTML(args[0]);
        delete workspaceQueues[args[0]];
        console.log("delete workspace successful");
      },
      "search-success": function () {
        disableOverlay();
        renderSearchResults(args[0]);
        console.log("search successful");
      },
      "index-success": function () {
        treeToBackupJson(args[0]);
        disableOverlay();
        console.log("index successful");
      },
      "update-success": function () {
        treeToBackupJson(args[0]);
        disableOverlay();
        console.log("update successful");
      },
      "delete-success": function () {
        treeToBackupJson(args[0]);
        disableOverlay();
        console.log("deletion successful");
      }
    }

    // response message triggers front end code and cycles queue if necessary
    // also catches if response is not in the dict, throws error
    try {
      respDict[resp]();
      // queue cycling for index ops
      if (resp == "index-success" || resp == "update-success" || resp == "delete-success") {
        let workspace = args[0];
        console.log("Workspace Queue: " + workspaceQueues[workspace]);
        dequeue(workspace);
        if (workspaceQueues[workspace].length != 0) {
          // Enabling overlay to disable search functionality if command requires indexing
          enableOverlay();
          let newCmd = workspaceQueues[workspace][0];
          connect_pyshell(newCmd[0], newCmd[1]);
        }
      }
    }
    catch (err) {
      alert("command error: " + err + " message: " + message);
      disableOverlay();
      let workspace = args[0];
      dequeue(workspace);
    }
  });
}

// QUEUE FUNCTIONS
function addWork(toBackend, data, guid) {
  if (workspaceQueues[guid].length == 0) {
    workspaceQueues[guid].push([toBackend, data]);
    // Enabling overlay to disable search functionality if command requires indexing
    enableOverlay();
    connect_pyshell(toBackend, data);
  }
  else {
    workspaceQueues[guid].push([toBackend, data]);
  }
  console.log("added command to queue:  " + workspaceQueues[guid].length);
}

/*function dequeue(guid) {
  workspaceQueues[guid].shift()
  console.log("removed command from queue: " + workspaceQueues[guid].length);
}*/

// Shows overlay that disables search functionality.
function enableOverlay() {
  document.getElementById('overlay-label').innerHTML = 'indexing...';
  $('#overlay').show();
  $('#overlay-message').css('display', 'flex');
}

function enableSearchingOverlay() {
  document.getElementById('overlay-label').innerHTML = 'searching...';
  $('#overlay').show();
  $('#overlay-message').css('display', 'flex');
}

// Gets rid of overlay that disables search funcitonality.
function disableOverlay() {
  $('#overlay').css('display', 'none');
  $('#overlay-message').css('display', 'none');
}