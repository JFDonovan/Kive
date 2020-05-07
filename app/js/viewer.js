// Create global variable for chrome-tabs
window.ChromeTabs = require('chrome-tabs')

var el = document.querySelector('.chrome-tabs')
var chromeTabs = new ChromeTabs()
chromeTabs.init(el)

// Map for storing each tab's webpage
let chromeMap = new Map();
let tabMap = new Map();

// Handle changing tabs
el.addEventListener('activeTabChange', ({ detail }) => {
    let disp = document.getElementById('html_disp');

    // tabId variable in the tab instance contains id of corresponding jstree node and corresponding path
    let id = detail.tabEl.dataset.tabId;

    // loading in proper source for iframe
    disp.src = chromeMap.get(id)
});

// Handle deleting tabs
el.addEventListener('tabRemove', ({ detail }) => {
    // Clear iframe if all tabs are closed
    chromeMap.delete(detail.tabEl.dataset.tabId);
    tabMap.delete(detail.tabEl.dataset.tabId);
    if ($('.chrome-tab').length === 0) {
        let disp = document.getElementById('html_disp');
        disp.src = "";
    }
});

// Updates chrome tab for a given node
function updateTab(node) {
    if (tabMap.get(node.id)) {
        chromeTabs.updateTab(tabMap.get(node.id), { title: node.name, id: node.id, favicon: node.icon });
    }
}

// Renders html file of node in iframe
function renderPage(node) {
    // Check if file exists
    try {
        // Throws error if file does not exist
        let integrity = fs.statSync(node.path);
        console.log(integrity);
        // Add new tab
        if (!(chromeMap.has(node.id))) {
            chromeTabs.addTab({
                title: node.name,
                id: node.id,
                favicon: node.element.childNodes[0].getElementsByClassName('file-icon')[0].src
            });

            chromeMap.set(node.id, node.path);
            tabMap.set(node.id, chromeTabs.activeTabEl);
        }
        else {
            chromeTabs.setCurrentTab(tabMap.get(node.id))
        }
        // Render web page
        let disp = document.getElementById('html_disp');
        disp.src = node.path;
        // Saves the open file path for saving
        open_files = node.path;
        // update date last accessed
        let currentTime = new Date();
        let date = currentTime.yyyymmdd()
        if (node.last_accessed != date) {
            updateNode(node, "last_accessed", date);
        }
    }
    // Path integrity has failed
    catch (err) {
        missingPath(node);
    }
}

// Opens html file of node in external browser
function openInBrowser(node) {
    // Opens path in another electron window (NOT IN USE)
    //window.open(path, '_system');


    // Check if file exists
    try {
        let integrity = fs.statSync(node.path);
        console.log(integrity);
        // Opens path in external browser
        //shell.openExternal(path).then(_ => _);
        shell.openItem(node.path);
        // update date last accessed (if does not match currently)
        let currentTime = new Date();
        let date = currentTime.yyyymmdd()

        if (node.last_accessed != date) {
            updateNode(node, "last_accessed", date);
        }
    }
    // Path integrity has failed
    catch (err) {
        missingPath(node);
    }
}
