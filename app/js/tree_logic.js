// For Initializing all trees at once (not currently in use)
function initTrees(workspaces) {
    workspaces.forEach((workspace) => {
        readTree(workspace);
    });
}

// Reads tree from workspaces tree json and initializes that tree
function readTree(workspace) {
    console.log('read_tree called');

    fs.readFile(appDataPath + "/workspace_repo/" + workspace + "/tree.json", 'utf-8', (err, data) => {
        if (err) {
            alert("An error occurred reading the tree file :" + err.message);
            return;
        }

        console.log("The tree file content is : " + data);

        // If json contains tree data: make a tree
        if (data.length > 0) {
            makeTree(workspace, JSON.parse(data));
        }
    });
}

// Append to an existing tree
function appendTree(workspace, data, parent_node) {
    console.log('appendTree called');

    // Reads from temp.json file
    /*fs.readFile("/Users/chrisyue/workspace_repo/" + workspace + "/temp.json", 'utf-8', (err, data) => {
        if (err) {
            alert("An error occurred reading the tree file :" + err.message);
            return;
        }*/
    if (!data) {
        console.error("Tree data is null");
    }
    else {
        // Finds the tree of the workspace passed in
        let $tree = $('#' + workspace + '_tree');
        // If parent node specified, append tree to parent node
        json_list = data;
        if (parent_node) {
            for (var i = 0; i < json_list.length; i++) {
                $tree.tree(
                    'appendNode',
                    json_list[i],
                    parent_node
                );
            }

        }
        // If parent node not specified  
        else {
            // If tree exists, append to root of tree
            if ($tree.tree('getTree')) {
                for (var i = 0; i < json_list.length; i++) {
                    $tree.tree(
                        'appendNode',
                        json_list[i],
                        parent_node
                    );
                }
            }
            // If tree does not exist, initialize tree
            else {
                makeTree(workspace, data);
            }
        }
        // Write tree data to tree json file in the workspace repo
        //treeToJson(workspace);
        // Adds tooltip logic to tree (when appending to the tree in this case)
        addTreeTooltips(workspace);
    }
    //});
}

// Generates and returns GUID
function uuid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Creates folder on given node (root if null)
function createFolder(node, folderName) {
    let newFolder = {
        name: folderName,
        type: 'folder',
        id: uuid4()
    };
    let $tree = $('#' + currentWorkspace + '_tree');
    // If parent node
    if (node) {
        $tree.tree(
            'appendNode',
            newFolder,
            node
        );
    }
    // If root
    else {
        if ($tree.tree('getTree')) {
            $tree.tree(
                'appendNode',
                newFolder,
            );
        }
        else {
            makeTree(currentWorkspace, [newFolder]);
        }
    }
    // Write tree data to tree json file in the workspace repo
    treeToJson(currentWorkspace);
    treeToBackupJson(currentWorkspace);
    // Adds tooltip logic to tree (when adding a folder node in this case)
    addTreeTooltips(currentWorkspace);
}

// Initializes tree
function makeTree(workspace, data) {
    console.log("make_tree called");

    // Gets base tree element of workspace and initializes tree (look up jqtree for attributes)
    $('#' + workspace + '_tree').tree({
        selectable: false, // Stops scrolling issue, but no longer select nodes (could make custom select)
        data: data,
        dragAndDrop: true,
        autoOpen: false,//1,
        //buttonLeft: false,
        //closedIcon: "",
        saveState: workspace + '_tree',
        // Specifies which node types can be dragged into
        onCanMoveTo: function (moved_node, target_node, position) {
            if (target_node.type == "file") {
                return false;
            }
            else {
                return true;
            }
        },
        onDragStop: function () {
            // Writes to tree file
            treeToJson(currentWorkspace);
            // Writes to tree backup file
            treeToBackupJson(currentWorkspace);
            // Adds tooltip logic to tree (when first making the tree in this case)
            addTreeTooltips(currentWorkspace);
        },

        // Adds icons to node titles on creation
        onCreateLi: function (node, $li, is_selected) {
            if (node.type == "file") {
                // Create new element for the icon
                let icon_element = document.createElement('img');
                let icon_src = "";
                // Add class to new element for css styling
                icon_element.classList.add("file-icon");
                
                // Could not load resource, reset to default file icon
                icon_element.onerror = function () {
                    node.element.childNodes[0].getElementsByClassName('file-icon')[0].src = 'app/style/fonts/world-icon.png';
                }

                // If node has valid icon field
                if (node.icon != "" && node.icon != undefined) {
                    icon_src = node.icon;
                    icon_element.src = icon_src;
                } else {
                    // Set icon_element to default file icon
                    icon_src = "app/style/fonts/world-icon.png";
                    icon_element.src = icon_src;
                }

                

                $li.find('.jqtree-title').before(icon_element.outerHTML);
            }
            if (node.type == "folder") {
                if (node.is_open) {
                    $li.find('.jqtree-title').before('<img class="file-icon" src="app/style/fonts/folder-open-icon.png">');
                } else {
                    $li.find('.jqtree-title').before('<img class="file-icon" src="app/style/fonts/folder-icon.png">');
                }
                
            }
        }
    });

    // Defines onclick for node
    $('#' + workspace + '_tree').on(
        'tree.dblclick',
        function (event) {
            // The clicked node is 'event.node'
            let node = event.node;
            if (node.type == "file") {
                // Renders page based on node.path
                renderPage(node);
            } else {
                if (node.is_open) {
                    $('#' + workspace + '_tree').tree('closeNode', node);
                } else {
                    $('#' + workspace + '_tree').tree('openNode', node);
                }
            }
        }
    );

    // Defines open folder icon change
    $('#' + workspace + '_tree').on(
        'tree.open',
        function (event) {
            // The clicked node is 'event.node'
            node = event.node;
            if (node.type == 'folder') {
                node.element.childNodes[0].getElementsByClassName('file-icon')[0].src = 'app/style/fonts/folder-open-icon.png';
            }
        }
    );

    // Defines close folder icon change
    $('#' + workspace + '_tree').on(
        'tree.close',
        function (event) {
            // The clicked node is 'event.node'
            node = event.node;
            if (node.type == 'folder') {
                node.element.childNodes[0].getElementsByClassName('file-icon')[0].src = 'app/style/fonts/folder-icon.png';
            }
        }
    );

    // Defines oncontextmenu for node
    $('#' + workspace + '_tree').on(
        'tree.contextmenu',
        function (event) {
            // The clicked node is 'event.node'
            var node = event.node;
            // Spawns context menu
            spawnContextMenu("file-tree", event, null);
        }
    );
    // Adds tooltip logic to tree (when first making the tree in this case)
    addTreeTooltips(workspace);
}

// Gets all of the web pages that are children of an affected node
function getChildFileNodes(node) {
    // If node is a leaf node, return an array only containing this node
    if (node.children.length == 0) {
        // Convert to required format for JSON.stringify (no circular relationships in JSON)
        var sendData = {
            id: node.id,
            path: node.path,
            name: node.name,
            legacy_ingest: node.legacy_ingest,
            ingest: node.ingest,
            last_accessed: node.last_accessed
        }

        return [sendData]
    }

    var webPages = [];
    for (var i = 0; i < node.children.length; i++) {
        webPages.push(...getChildFileNodes(node.children[i]))
    }
    console.log(webPages);
    return webPages;
}

// Deletes node (assumes current workspace)
function deleteNode(node) {
    console.log(node);
    var toDeleteFromIdx = getChildFileNodes(node);
    console.log(toDeleteFromIdx);
    // Update tree
    $('#' + currentWorkspace + '_tree').tree('removeNode', node);
    // Write tree data to tree json file in the workspace repo
    //treeToJson(currentWorkspace);
    // Adds tooltip logic to tree (when deleting a node in this case)
    addTreeTooltips(currentWorkspace);
    // Sends index command, node Id, and current workspace to backend
    // Adds command to queue
    addToQueue("index/delete/" + currentWorkspace, null, {'json_lst': toDeleteFromIdx}, currentWorkspace);
}

// Update node (assumes current workspace)
// Currently, only updates one file at a time.
// Send as JSON array (currently containing 1 element) so that we can possibly handle
// batch updates in the future.
function updateNode(node, key, value) {
    console.log("update node called: ");
    console.log(node);
    let tempObj = {};
    tempObj[key] = value;
    // Update the node
    $('#' + currentWorkspace + '_tree').tree(
        'updateNode',
        node,
        tempObj
    );
    // Updates chrome tab for the node
    updateTab(node)
    // Write tree data to tree json file in the workspace repo
    //treeToJson(currentWorkspace);
    // Adds tooltip logic to tree (when when updating a node in this case)
    addTreeTooltips(currentWorkspace);
    // Trigger reindexing of node
    if (node.type == "file") {
        // Convert to required format for JSON.stringify (no circular relationships in JSON)
        var sendData = {
            id: node.id,
            path: node.path,
            name: node.name,
            legacy_ingest: node.legacy_ingest,
            ingest: node.ingest,
            source: node.source,
            icon: node.icon,
            last_accessed: node.last_accessed
        }
        console.log("Send data: ");
        console.log(sendData);
        // Sends index command, node Id, and current workspace to backend
        addToQueue("index/update/" + currentWorkspace, null, {"json_lst": [sendData]}, currentWorkspace);
    }
}

// Writes tree json to tree file of a workspace
function treeToJson(workspace) {
    console.log("tree to json called: " + workspace);

    // Gets tree json of current workspace tree
    treeJson = $('#' + workspace + '_tree').tree('toJson');

    // Writes to tree json
    fs.writeFile(appDataPath + "/workspace_repo/" + workspace + "/tree.json", treeJson, (err) => {
        if (err) {
            alert("An error ocurred updating the file" + err.message);
            console.log(err);
            return;
        }

        console.log("The tree json has been succesfully written: " + workspace);
    });
}

// Writes tree json to backup tree file of a workspace
function treeToBackupJson(workspace) {
    console.log("tree to json called: " + workspace);

    // Gets tree json of current workspace tree
    treeJson = $('#' + workspace + '_tree').tree('toJson');

    // Writes to tree_backup.json
    fs.writeFile(appDataPath + "/workspace_repo/" + workspace + "/tree_backup.json", treeJson, (err) => {
        if (err) {
            alert("An error ocurred updating the file" + err.message);
            console.log(err);
            return;
        }

        console.log("The tree backup json has been succesfully written: " + workspace);
    });
}

// Scrolls to a node in the file tree of the current workspace
function scrollToNodeInTree(node) {
    // Open up all parent folders if a node is nested
    let parent = node.parent
    while (parent) {
        $(`#${currentWorkspace}_tree`).tree('openNode', parent);
        parent = parent.parent
    }

    // Scroll to node
    $(`#${currentWorkspace}_tree`).tree('scrollToNode', node);

    // Highlight the node
    $(`#${currentWorkspace}_tree`).tree('addToSelection', node);
}

// Handles failed path integrity
function missingPath(node) {

    // Initialize folderList
    let folderList = node.path[0].split("\\");

    // Set folder list based on platform OS
    if (platform == "Windows") {
        folderList = node.path[0].split("\\");
    }
    else {
        folderList = node.path[0].split("/");
    }


    let closestPath = folderList[0];
    let closestPathIndex = 0;

    // Find closest path
    for (let x = folderList.length - 1; x >= 0; x--) {
        let tryPath = "";
        for (let y = 0; y <= x; y++) {
            tryPath += folderList[y] + "\\";
        }
        // Check if path exists
        try {
            let integrity = fs.statSync(tryPath);
            console.log(integrity);
            // Set closest path to missing files source
            closestPath = tryPath;
            closestPathIndex = x;
            break;
        }
        // Path integrity has failed
        catch (err) {
            console.log(tryPath + " is not found");
        }
    }

    console.log("Clostest path: " + closestPath + " index: " + closestPathIndex);

    // Files directory is still there
    if (closestPathIndex == folderList.length - 1) {
        // Change color of node
        openModal("find-lost-file", "File not found!", ["Choose new file path: "], function (newPath) { replaceFilePath(node, newPath) });
    }
    // Files immediate directory is missing also
    else {
        alert("folder not found, implement");
    }

}

// Replaces path of node and renders page
function replaceFilePath(node, newPath) {

    // TEMPORARY UNTIL INDEXES ON NODES
    updateNode(node, "path", newPath);
    // Renders page
    renderPage(node);

    /*$('#' + currentWorkspace + '_tree').tree(
        'updateNode',
        node,
        {
            path: newPath
        }
    );
    // Writes to tree file
    treeToJson(currentWorkspace);
    // Renders page
    renderPage(node);
    // Writes to tree backup file
    treeToBackupJson(currentWorkspace);
    // Adds tooltip logic to tree (when first making the tree in this case)
    addTreeTooltips(currentWorkspace);*/
}
