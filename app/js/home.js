

// Creates all html elements for workspace
function workspaceHTML(workspace, workspaceName) {
    // Workspace buttons
    let opt = document.createElement("BUTTON");
    opt.appendChild(document.createTextNode(workspaceName));
    opt.id = workspace + "_btn";
    //opt.className = "workspace_btn btn btn-secondary"
    opt.className = "workspace_btn btn btn-secondary";
    // Sends user to workspace view with the context of that workspace
    opt.onclick = function () { goToWorkspace(workspace, workspaceName) };

    // Opens context menu on right click of workspace button
    opt.oncontextmenu = function (event) { spawnContextMenu("workspace-button", event, workspace) };

    let optRow = document.createElement("DIV");
    optRow.classList.add("row");
    optRow.appendChild(opt);

    let btns = document.getElementById("workspace_btns");
    btns.appendChild(optRow);

    // JQTree divs for each workspace
    let treeDiv = document.createElement("DIV");
    treeDiv.id = workspace + "_tree";
    treeDiv.classList.add("hidden");
    let treeDisp = document.getElementById("tree_display");
    treeDisp.appendChild(treeDiv);
}

// Creates new Workspace
function createWorkspace(name) {
    console.log("create workspace called");
    // Send create workspace command to backend
    let toBackend = ("/create-workspace/" + name + "/");
    getRequest(toBackend, name);
}

// Renames workspace
function renameWorkspace(name, guid) {
    console.log("rename workspace called");
    let remote = require('electron').remote;
    let dialog = remote.dialog;
    let fs = remote.require('fs');

    // Reads from workspaces json
    fs.readFile("/Users/chrisyue/workspace_repo/workspaces.json", 'utf-8', (err, data) => {
        if (err) {
            // Failure
            alert("An error occurred reading the tree file :" + err.message);
            return;
        }
        // Success
        console.log("The workspaces file content is : " + data);

        // Changes name in json object
        let workspacesJson = JSON.parse(data);
        workspacesJson[guid]["name"] = name;

        // Checks to see that workspaces json was successfully read from tree 
        if (workspacesJson) {
            // Writes workspacesJson object to workspaces json
            fs.writeFile("/Users/chrisyue/workspace_repo/workspaces.json", JSON.stringify(workspacesJson), (err) => {
                if (err) {
                    // Failure
                    alert("An error ocurred updating the file" + err.message);
                    console.log(err);
                    return;
                }
                // Success
                console.log("The workspaces json has been succesfully written: " + guid);
                // Updates name in html
                let wsBtn = document.getElementById(guid+"_btn");
                wsBtn.textContent = name;
                wsBtn.onclick = function () { goToWorkspace(guid, name) };
            });
        }
        else {
            console.log("workspacesJson not defined");
        }
    });
}

// Deletes workspace
function deleteWorkspace(guid) {
    console.log("delete workspace called");
    // Send delete workspace command to backend
    let toBackend = ("/delete-workspace/" + guid + "/");
    getRequest(toBackend, guid);
}
// Removes workspace html
function deleteWorkspaceHTML(guid) {
    removeHTML(guid + "_tree");
    removeHTML(guid + "_btn");
}

// Removes html element by id
function removeHTML(id) {
    let elem = document.getElementById(id);
    elem.parentNode.removeChild(elem);
}