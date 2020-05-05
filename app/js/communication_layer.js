// Shuts server down
module.exports = {
    shutdown: () => { console.log('shutdown server called'); getRequest('shutdown', null) }
}

// Makes POST request at endpoint at path
function getRequest(path, context) {
    console.log("Get Request called");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Handles response
            handleResponse(xhttp.responseText, context);
        }
    };
    xhttp.open("GET", "http://localhost:5000/" + path, true);
    xhttp.send();
}

// Makes POST request at endpoint at path
function postRequest(path, context, json_obj) {
    console.log("Post Request called");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Handles response
            handleResponse(xhttp.responseText, context);
        }
    };
    xhttp.open("POST", "http://localhost:5000/" + path, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(json_obj));
}

// Handles response from backend
function handleResponse(response, context) {
    console.log("Response from backend: ", response);

    swal(response); //TEMP

    // Parses response to json object
    let respObj = JSON.parse(response);

    let respCmd = respObj.message;


    // Response dictionary
    let respDict = {
        // Success responses
        "import-success": function () {
            console.log("import successful");
            addToQueue("index/add/" + respObj.workspace_guid, null, {"json_lst": respObj.json_lst}, respObj.workspace_guid);
            appendTree(respObj.workspace_guid, respObj.json_tree, context);
        },
        "create-workspace-success": function () {
            workspaceHTML(respObj.workspace_guid, respObj.name);
            workspaceQueues[respObj.workspace_guid] = [];
            console.log("create workspace successful");
        },
        "delete-workspace-success": function () {
            deleteWorkspaceHTML(respObj.workspace_guid);
            delete workspaceQueues[respObj.workspace_guid];
            console.log("delete workspace successful");
        },
        "search-success": function () {
            disableOverlay();
            renderSearchResults(respObj.results);
            console.log("search successful");
        },
        "index-success": function () {
            indexSuccessHandler(respObj.workspace_guid);
            console.log("index successful");
        },
        "update-success": function () {
            indexSuccessHandler(respObj.workspace_guid);
            console.log("update successful");
        },
        "delete-success": function () {
            indexSuccessHandler(respObj.workspace_guid);
            console.log("deletion successful");
        },
        // Failure responses
        /*"failure": function () {
            disableOverlay();
            console.error("Failure of ", respObj.attempt, " : ", respObj.error);
            alert(respObj.attempt + " failure");
        },*/
        "import-failure": function () {
            console.error("import failure: ", respObj.workspace_guid, " : ", respObj.error);
            alert("import failure");
        },
        "create-workspace-failure": function () {
            console.error("create workspace failure: ", respObj.workspace_guid, " : ", respObj.error);
            alert("create workspace failure");
        },
        "delete-workspace-failure": function () {
            console.error("delete workspace failure: ", respObj.workspace_guid, " : ", respObj.error);
            alert("delete workspace failure");
        },
        "search-failure": function () {
            disableOverlay();
            console.error("search failure: ", respObj.error);
            alert("search failure");
        },
        "index-failure": function () {
            indexFailureHandler(respObj.workspace_guid);
            console.error("index failure: ", respObj.workspace_guid, " : ", respObj.error);
            alert("index failure");
        }
        /*"update-failure": function () {
            indexFailureHandler(respObj.workspace_guid);
            console.error("update failure: ", respObj.workspace_guid, " : ", respObj.error);
            alert("update failure");
        },
        "delete-failure": function () {
            indexFailureHandler(respObj.workspace_guid);
            console.error("delete failure: ", respObj.workspace_guid, " : ", respObj.error);
            alert("delete failure");
        },*/
    }

    // Execute function based on response
    try {
        respDict[respCmd]();
    }
    catch (err) {
        alert("invalid command: " + err + " response cmd: " + respCmd);
    }
}

// Handles indexing success
function indexSuccessHandler(workspace) {
    // Write tree to tree.json
    treeToJson(workspace)
    // Dequeue
    dequeue(workspace);
    // Disable overlay for indexing
    disableOverlay();
    if (workspaceQueues[workspace].length != 0) {
        // Enabling overlay to disable search functionality if command requires indexing
        enableOverlay();
        // Send next command to backend
        let nextCmd = workspaceQueues[workspace][0];
        postRequest(nextCmd[0], nextCmd[1]);
    }
    // Write to back up tree json
    treeToBackupJson(workspace);
}

// Handles indexing failure
function indexFailureHandler(workspace) {
    // Dequeue
    dequeue(workspace);
    // Disable overlay for indexing
    disableOverlay();
}

// Adds command to given workspace queue (queue only used for indexing)
function addToQueue(endpoint, context, jsonObj, guid) {
    // If queue is empty, add to queue run command immediately 
    if (workspaceQueues[guid].length == 0) {
        workspaceQueues[guid].push([endpoint, context]);
        // Enabling overlay to disable search functionality if command requires indexing
        enableOverlay();
        // Make post request
        postRequest(endpoint, context, jsonObj);
    }
    // If queue is not empty, add command to queue and wait
    else {
        workspaceQueues[guid].push([endpoint, context]);
    }
    console.log("Added", [endpoint, context], "to " + guid + "queue:  " + workspaceQueues[guid].length);
}

// Dequeues from given workspace
function dequeue(guid) {
    // Remove from front of array (dequeue)
    let cmd = workspaceQueues[guid].shift();
    console.log("Removed", cmd, "from queue: " + workspaceQueues[guid].length);
}

// Shows overlay that disables search functionality.
function indexingOverlay() {
    document.getElementById('overlay-label').innerHTML = 'indexing...';
    $('#overlay').show();
    $('#overlay-message').css('display', 'flex');
    console.log("Displayed index overlay");
}

// Shows overlay that
function searchingOverlay() {
    document.getElementById('overlay-label').innerHTML = 'searching...';
    $('#overlay').show();
    $('#overlay-message').css('display', 'flex');
    console.log("Displayed searching overlay");
}

// Gets rid of overlay that disables search funcitonality.
function disableOverlay() {
    $('#overlay').css('display', 'none');
    $('#overlay-message').css('display', 'none');
    console.log("Removed overlay");
}