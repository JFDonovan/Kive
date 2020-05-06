

var path = require("path");

// ***** Global variable that stores guid of current workspace
var currentWorkspace = null;
var workspaceQueues = {};

// ***** Global variable that stores OS
var OS = getOS();

// Runs executable which starts local server
var child = require('child_process').execFile;

// Path to executable
var executablePath = path.join(__dirname, '/app/backend/dist/server');
if (OS == 'Windows') {
    executablePath = path.join(__dirname, '/app/backend/dist/server.exe');
}

let remote = require('electron').remote;
var appDataPath = remote.getGlobal('sharedObject').appDataPath;

// Runs executable to start backend server
/*child(executablePath, [appDataPath], function (err, data) {
    if (err) {
        console.error(err);
        return;
    }
    else {
        console.log("Server started...");
    }
});*/


// Gets OS
function getOS() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
        os = 'Linux';
    }

    return os;
}

// Called on body onload
function onLoad() {
    console.log('read_tree called');
    let remote = require('electron').remote;
    let dialog = remote.dialog;
    let fs = remote.require('fs');
    let shell = require('electron').shell

    // Bind an event listener to the loaded iframe to catch any link clicks
    $('body iframe').on('load', function () {
        $(this).contents().find('a').bind('click', function (e) {
            e.preventDefault();
            let target = e.target;
            while (!target.href) {
                target = target.parentElement;
            }
            shell.openExternal(target.href).then(_ => _);
        })
    });

    // For creating compatible date strings 
    Date.prototype.yyyymmdd = function () {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();

        return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
        ].join('');
    };

    // Read each workspace json
    fs.readFile(appDataPath + "/workspace_repo/workspaces.json", 'utf-8', (err, data) => {
        if (err) {
            // Couldn't find workspace_repo/workspaces.json
            console.log("No workspace_repo/workspaces.json present.");
            // Create kive_data repo
            fs.mkdirSync(appDataPath);
            // Create the workspace_repo directory
            fs.mkdirSync(appDataPath + "/workspace_repo");
            // Create the workspaces.json file 
            fs.writeFile(appDataPath + "/workspace_repo/workspaces.json", '{}', function (err2) {
                if (err2) throw (err2);
                console.log("Succesfully wrote file.");
            });
            // Set data to empty workspace
            data = '{}';
        }

        console.log("The workspaces file content is : " + data);


        let workspacesJson = JSON.parse(data);
        let workspaces = Object.keys(workspacesJson);

        // Initialize all workspaces
        workspaces.forEach((workspace) => {
            let workspaceName = workspacesJson[workspace].name;
            // Initialize workspace elements
            workspaceHTML(workspace, workspaceName);
            workspaceQueues[workspace] = [];
        });

        // Listen for click anywhere in window
        document.addEventListener("click", function (event) {
            despawnContextMenu(event)
        });
    });
}