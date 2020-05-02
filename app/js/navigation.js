function goToSearchView() {
    // Hides file view components and shows search view components
    let search = document.getElementById("search_view");
    let searchBtn = document.getElementById("search_tab_btn");
    let files = document.getElementById("files_view");
    let filesBtn = document.getElementById("files_tab_btn");
    search.classList.remove("hidden");
    files.classList.add("hidden");
    searchBtn.classList.add("open");
    filesBtn.classList.remove("open");
}

function goToFilesView() {
    // Hides search view components and shows file view components
    let search = document.getElementById("search_view");
    let searchBtn = document.getElementById("search_tab_btn");
    let files = document.getElementById("files_view");
    let filesBtn = document.getElementById("files_tab_btn");
    search.classList.add("hidden");
    files.classList.remove("hidden");
    searchBtn.classList.remove("open");
    filesBtn.classList.add("open");
}

// For going to workspace
function goToWorkspace(workspace, name) {
    console.log("Go to " + workspace + " Called");

    // Initializes tree of workspace entered (if not already initialized)
    if (!$('#' + workspace + "_tree").tree('getTree')) {
        readTree(workspace);
    }

    // Saves previous workspace and sets current workspace
    let prevWorkspace = currentWorkspace;
    currentWorkspace = workspace;
    // Makes correct tree visible and hides previous workspace tree
    if (prevWorkspace) {
        let prevTree = document.getElementById(prevWorkspace + "_tree");
        if (prevTree) {
            prevTree.classList.add("hidden");
        }
    }
    let tree = document.getElementById(workspace + "_tree");
    tree.classList.remove("hidden");
    // Sets workspace title to name
    let workspaceTitle = document.getElementById("workspace_title");
    workspaceTitle.textContent = name;
    // Makes workspace view visible and home hidden
    let home = document.getElementById("home");
    home.classList.add("hidden");
    let wsView = document.getElementById("workspace_view");
    wsView.classList.remove("hidden");
}

function goToHome() {
    console.log("Go Home Called");
    // Makes home visible and workspace view hidden
    let home = document.getElementById("home");
    home.classList.remove("hidden");
    let wsView = document.getElementById("workspace_view");
    wsView.classList.add("hidden");
}