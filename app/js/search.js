
// Toggles advanced search ui dropdown
function toggleAdvancedMenu() {
    let menu = document.getElementById("adv-search_panel");
    if (menu.classList.contains("hidden")) {
        menu.classList.remove("hidden");
    }
    else {
        menu.classList.add("hidden");
    }
}

// Gets query values and sends search command and arguments to backend
function getSearchQuery() {
    let validQuery = true

    // Main search query
    let searchQuery = document.getElementById("search_query").value;

    // Title and visible text boolean options
    let title = document.getElementById("search-set_title").checked;
    let visibleText = document.getElementById("search-set_visible_text").checked;

    // Date last accessed range
    let dla = document.getElementById("search-set_dla").checked;
    let startDla = document.getElementById("start_dla").value.split("-").join("");
    let endDla = document.getElementById("end_dla").value.split("-").join("");

    // Date ingested into Kive range
    let dik = document.getElementById("search-set_dik").checked;
    let startDik = document.getElementById("start_dik").value.split("-").join("");
    let endDik = document.getElementById("end_dik").value.split("-").join("");

    // Date ingested legacy range
    let dil = document.getElementById("search-set_dil").checked;
    let startDil = document.getElementById("start_dil").value.split("-").join("");
    let endDil = document.getElementById("end_dil").value.split("-").join("");

    // Media query (queries currently split up by *)
    let media = document.getElementById("search-set_media").checked;
    let mediaQuery = document.getElementById("media_query").value.split("*");

    // Formats media queries
    /*let mediaQueryStr = "[";
    for (let x = 0; x < mediaQuery.length; x++) {
        mediaQueryStr += ("'" + mediaQuery[x] + "',");
    }
    mediaQueryStr += "]";*/

    // Formats list of filters for search
    let options = [];
    if (title)
        options.push("name");
    if (visibleText)
        options.push("content");
    if (dla) {
        if (endDla != "" && startDla > endDla) 
            validQuery = false;

        options.push("last_accessed");
    }
    if (dik) {
        if (endDik != "" && startDik > endDik) 
            validQuery = false;
            
        options.push("ingest");
    }
    if (dil) {
        if (endDil != "" && startDil > endDil) 
            validQuery = false;

        options.push("legacy_ingest");
    }
    if (media) {
        options.push("media_files");
    }

    // Message sent to backend
    if(validQuery) {
        let queryObj = {
            search_query: searchQuery,
            date_last_accessed: [startDla, endDla],
            date_ingested_legacy: [startDil, endDil],
            date_ingested_kive: [startDik, endDik],
            options: options,
            media_query: mediaQuery,
        }
        postRequest("search/" + currentWorkspace, null, queryObj);
    }
    else {
        openModal("search-query-error", "Search Error", [], null)
    }
}

// Renders a list of paths representing search results
function renderSearchResults(results) {
    // Clear results list
    let resultListHtmlObj = document.getElementById("results_list")
    resultListHtmlObj.innerHTML = ""

    jsonList = JSON.parse(results)
    
    for (let i = 0; i < jsonList.length; i++) {
        let treeNode = $(`#${currentWorkspace}_tree`).tree('getNodeById', jsonList[i].id);

        resultListHtmlObj.appendChild(
            createSearchResultListItem(treeNode));
    }

    // Show new result quantity
    let resultsLabel = document.getElementById("results_label");
    resultsLabel.innerText = `(${jsonList.length} results)`
}

// Helper to create the HTML element for each search result
function createSearchResultListItem(node) {
    let resultNode = document.createElement("LI");
    resultNode.className = "list-group-item"; // for bootstrap

    // Result itself will be an anchor
    let resultAnchor = document.createElement("A");
    resultAnchor.className = node.id;
    resultAnchor.appendChild(document.createTextNode(node.name));
    // Opens context menu on right click of workspace button
    resultAnchor.oncontextmenu = function (event) { spawnContextMenu("search-result", event, node) };
    resultAnchor.ondblclick = function () {
        renderPage(node);
    }

    resultNode.appendChild(resultAnchor);

    return resultNode
}

function seeSearchResultInTree(node) {
    goToFilesView();
    scrollToNodeInTree(node);
}
