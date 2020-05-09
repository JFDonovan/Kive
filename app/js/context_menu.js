
function spawnContextMenu(type, event, context) {
    // Base context menu element
    let menu = document.getElementById("context_menu");
    // Base list element for context menu options
    let menuList = menu.getElementsByClassName("menu-options")[0];
    menuList.innerHTML = "";

    // Initialize default positioning
    let posX = 0;
    let posY = 0;

    // If event has node associated with it (jqtree event)
    if (type == "file-tree") {
        // Menu options for all nodes
        menuList.appendChild(makeContextMenuOption("Rename", function () { openModal("single-input", "Rename node", ["New Name: "], function (name) { updateNode(event.node, "name", name) }) }));
        menuList.appendChild(makeContextMenuOption("Delete", function () { openModal("confirmation", "Delete node", ["Are you sure you want to delete this?"], function () { deleteNode(event.node) }) }));
        /*menuList.appendChild(makeContextMenuOption("cut", function () { alert("implement cut paste") }));*/
        // Menu options for folder nodes only
        if (event.node.type == "folder") {
            menuList.appendChild(makeContextMenuOption("Create Folder", function() { openModal('single-input', 'New Folder', ['Folder Name: '], function (name) { createFolder(event.node, name); })}));
            menuList.appendChild(makeContextMenuOption("Import File", function () { get_file(event.node.id) }));
            menuList.appendChild(makeContextMenuOption("Import Folder", function () { get_folder_nonleg(event.node) }));
            menuList.appendChild(makeContextMenuOption("Import Web-Scrapbook", function () { get_folder("wsb", event.node) }));
            menuList.appendChild(makeContextMenuOption("Import Scrapbook", function () { get_folder("sb", event.node) }));
        }
        // Menu options for file nodes only
        else if (event.node.type == "file") {
            menuList.appendChild(makeContextMenuOption("Open in Browser", function () { openInBrowser(event.node) }));
            menuList.appendChild(makeContextMenuOption("Get Info", function () { openModal("get-info", "Information", [event.node], null) }));
        }
        // Set menu position based on click event
        posX = event.click_event.pageX;
        posY = event.click_event.pageY;
    }

    // Right click on workspace button
    else if (type == "workspace-button") {
        // Menu options for all workspaces
        menuList.appendChild(makeContextMenuOption("Rename", function () { openModal("single-input", "Rename node", ["New Name: "], function (name) { renameWorkspace(name, context) }) }));
        menuList.appendChild(makeContextMenuOption("Delete", function () { openModal("confirmation", "Delete node", ["Are you sure you want to delete this?"], function () { deleteWorkspace(context) }) }));
        //menuList.appendChild(makeContextMenuOption("cut", function () { alert("implement cut paste") }));
        // Set menu position based on click event
        posX = event.pageX;
        posY = event.pageY;
    }
    // Right click on search result
    else if (type == "search-result") {
        // Menu options for all search results
        menuList.appendChild(makeContextMenuOption("Preview", function() { renderPage(context) }));
        menuList.appendChild(makeContextMenuOption("Open in Browser", function() { openInBrowser(context) }));
        menuList.appendChild(makeContextMenuOption("Show in Tree", function() { seeSearchResultInTree(context) }));
        menuList.appendChild(makeContextMenuOption("Get Info", function () { openModal("get-info", "Information", [context], null) }));
        
        // Set menu position based on click event
        posX = event.pageX;
        posY = event.pageY;
    }

    // Window height and width
    let windWidth = window.innerWidth;
    let windHeight = window.innerHeight;
    // Display and position context menu element
    menu.style.left = posX + "px";
    if (posY > windHeight / 2) {
        menu.style.top = (posY - menu.offsetHeight) + "px";
    }
    else {
        menu.style.top = posY + "px";
    }
    menu.style.display = "block";
}

// Makes context menu option element (takes text and function to be called on option click)
function makeContextMenuOption(text, func) {
    let opt = document.createElement("LI");
    opt.className = "menu-option";
    opt.appendChild(document.createTextNode(text));
    opt.onclick = func;
    return opt;
}

// Closes context menu
function despawnContextMenu(event) {
    let menu = document.getElementById("context_menu");
    menu.style.display = "none";
}