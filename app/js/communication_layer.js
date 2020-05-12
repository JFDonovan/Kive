/**
 * 
 * Summary. 
 * 
 * This file is where we facilitate API requests to our backend. 
 * 
 * GET requests are used for all API calls except those that involve indexing such as
 * adding files to the index, deleting, renaming, and updating the date last accessed. 
 * 
 * POST requests are used for all index related requests. In order to ensure that we are not concurrently writing to the same file
 * we have a queue that holds POST requests for each workspace. 
 * 
 * This file contains the queue logic, as well.
 * 
 */

var overlayList = []

// Shuts server down
module.exports = {
    shutdown: () => {
        console.log('shutdown server called');

        let check = false;
    }
}

// Global variable for storing overlays for current processes running
var overlayList = []

// Makes POST request at endpoint at path
function getRequest(path, context) {
    console.log("Get Request called: ", path);
    var start = performance.now();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
             // For latency
             var end = performance.now()
             console.log(`Import time: ${end - start}`);

            // Handles response
            handleResponse(xhttp.responseText, context);
        }
    };
    xhttp.open("GET", "http://localhost:5000/" + path, true);
    xhttp.send();
}

// Makes POST request at endpoint at path
function postRequest(path, context, json_obj) {
    console.log("Post Request called: ", path, context, json_obj);
    var start = performance.now();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // For latency
            var end = performance.now()
            console.log(`Index time: ${end-start}`);

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

    //swal(response); //TEMP

    // Parses response to json object
    let respObj = JSON.parse(response);

    let respCmd = respObj.message;


    // Response dictionary
    let respDict = {
        // Success responses
        "import-success": function () {
            dequeueOverlay("import");
            console.log("import successful");
            addToQueue("index/add/" + respObj.workspace_guid, null, { "json_lst": respObj.json_lst }, respObj.workspace_guid);
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
            dequeueOverlay("search");
            renderSearchResults(respObj.results);
            console.log("search successful");
        },
        "index-success": function () {
            indexSuccessHandler(respObj.workspace_guid, respObj.source_update_nodes);
            console.log("index successful");
        },
        "update-success": function () {
            updateSuccessHandler(respObj.workspace_guid);
            console.log("update successful");
        },
        "delete-success": function () {
            updateSuccessHandler(respObj.workspace_guid);
            console.log("deletion successful");
        },
        // Failure responses
        "import-failure": function () {
            dequeueOverlay("import");
            console.error("import failure: ", respObj.workspace_guid, " : ", respObj.error);
            alert("import failure");
        },
        // No data/ folder found for legacy import
        "import-failure-no-data": function () {
            dequeueOverlay("import");
            console.error("import failure: ", respObj.workspace_guid, " : ", respObj.error);
            openModal("no-data-folder", "No Data Folder Found", [], function () { })
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
            dequeueOverlay("search");
            console.error("search failure: ", respObj.error);
            alert("search failure");
        },
        "index-failure": function () {
            indexFailureHandler(respObj.workspace_guid);
            console.error("index failure: ", respObj.workspace_guid, " : ", respObj.error);
            alert("index failure");
        },
        "update-failure": function () {
            indexFailureHandler(respObj.workspace_guid);
            console.error("update failure: ", respObj.workspace_guid, " : ", respObj.error);
            alert("update failure");
        },
        "delete-failure": function () {
            indexFailureHandler(respObj.workspace_guid);
            console.error("delete failure: ", respObj.workspace_guid, " : ", respObj.error);
            alert("delete failure");
        }
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
function indexSuccessHandler(workspace, node_list) {

    // Update all source and icon fields for every node in list
    node_list.forEach(element => {
        let updateObj = {}
        let node = $(`#${currentWorkspace}_tree`).tree('getNodeById', element.id);
        updateObj['source'] = element.source
        updateObj['icon'] = element.icon

        $('#' + currentWorkspace + '_tree').tree(
            'updateNode',
            node,
            updateObj
        );
    });

    updateSuccessHandler(workspace);
}

// Handles indexing success
function updateSuccessHandler(workspace) {
    // Write tree to tree.json
    treeToJson(workspace)
    // Dequeue
    dequeue(workspace);
    // Disable overlay for indexing
    dequeueOverlay("index");
    if (workspaceQueues[workspace].length != 0) {
        // Enabling overlay to disable search functionality if command requires indexing
        queueOverlay("index");
        // Send next command to backend
        let nextCmd = workspaceQueues[workspace][0];
        postRequest(nextCmd[0], nextCmd[1], nextCmd[2]);
    }
    // Write to back up tree json
    treeToBackupJson(workspace);
}

// Handles indexing failure
function indexFailureHandler(workspace) {
    // Dequeue
    dequeue(workspace);
    // Disable overlay for indexing
    dequeueOverlay("index");
}

// Adds command to given workspace queue (queue only used for indexing)
function addToQueue(endpoint, context, jsonObj, guid) {
    // If queue is empty, add to queue run command immediately 
    if (workspaceQueues[guid].length == 0) {
        workspaceQueues[guid].push([endpoint, context, jsonObj]);
        // Enabling overlay to disable search functionality if command requires indexing
        queueOverlay("index");
        // Make post request
        postRequest(endpoint, context, jsonObj);
    }
    // If queue is not empty, add command to queue and wait
    else {
        workspaceQueues[guid].push([endpoint, context, jsonObj]);
    }
    console.log("Added", [endpoint, context], "to " + guid + "queue:  " + workspaceQueues[guid].length);
}

// Dequeues from given workspace
function dequeue(guid) {
    // Remove from front of array (dequeue)
    let cmd = workspaceQueues[guid].shift();
    console.log("Removed", cmd, "from queue: " + workspaceQueues[guid].length);
}

// OVERLAY STUFF

// Queues overlay
function queueOverlay(type) {
    console.log("queue overlay called");
    overlayList.push(type);
    displayOverlay(type);
}

// Displays overlay
function displayOverlay(type) {
    console.log("display overlay called");
    let topOverlay = document.getElementById("loading_overlay");
    let topOverlayText = topOverlay.getElementsByTagName("SPAN")[0];
    let overlay = document.getElementById("overlay");
    let overlayContent = document.getElementById("overlay-message");
    let overlayLabel = document.getElementById("overlay-label");

    topOverlay.classList.remove("hidden");
    overlay.classList.remove("hidden");
    overlayContent.classList.remove("hidden");

    switch (type) {
        case "search":
            topOverlayText.innerHTML = "Searching...";
            overlayLabel.innerHTML = "Searching...";
            break;
        case "index":
            topOverlayText.innerHTML = "Indexing...";
            overlayLabel.innerHTML = "Indexing...";
            break;
        case "import":
            topOverlayText.innerHTML = "Importing...";
            overlayLabel.innerHTML = "Importing...";
    }
}

// Dequeues overlay
function dequeueOverlay(type) {
    console.log("dequeue overlay called");
    console.log(overlayList);
    let topOverlay = document.getElementById("loading_overlay");
    let topOverlayText = topOverlay.getElementsByTagName("SPAN")[0];
    let overlay = document.getElementById("overlay");
    let overlayContent = document.getElementById("overlay-message");

    let index = overlayList.indexOf(type);
    if (index > -1) {
        console.log("splice");
        overlayList.splice(index, 1);
    }

    if (overlayList.length > 0) {
        displayOverlay(overlayList[0]);
    }
    else {
        topOverlay.className = "hidden";
        topOverlayText.innerHTML = "Loading...";
        overlay.className = "hidden";
        overlayContent.className = "hidden";
        overlayText = "Loading...";
    }
}
