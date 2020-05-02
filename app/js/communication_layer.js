// Shuts server down
module.exports = {
    shutdown: () => { console.log('shutdown server called'), test('shutdown/') }
}

// Makes POST request at endpoint at path
function getRequest(path) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            handleResponse(xhttp.responseText);
        }
    };
    xhttp.open("GET", "http://localhost:5000/" + path, true);
    xhttp.send();
}

// Makes POST request at endpoint at path
function postRequest(path) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            handleResponse(xhttp.responseText);
        }
    };
    xhttp.open("POST", "http://localhost:5000/" + path, true);
    xhttp.send();
}

// Handles response from backend
function handleResponse(response) {
    alert(response);
}

// 
function addToQueue(endpoint, data, guid) {
    if (workspaceQueues[guid].length == 0) {
        workspaceQueues[guid].push([endpoint, data]);
        // Enabling overlay to disable search functionality if command requires indexing
        enableOverlay();
        postRequest(endpoint, data);
    }
    else {
        workspaceQueues[guid].push([toBackend, data]);
    }
    console.log("added command to " + +"queue:  " + workspaceQueues[guid].length);
}

function dequeue(guid) {
    workspaceQueues[guid].shift()
    console.log("removed command from queue: " + workspaceQueues[guid].length);
}

// Shows overlay that disables search functionality.
function indexingOverlay() {
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