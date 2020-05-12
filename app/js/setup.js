/**
 * 
 * Summary. 
 * 
 * This file contains the onload logic for Kive. As soon as Electron's renderer process 
 * begins, onLoad() within this file gets triggered. Any logic or settings that need to
 * be done as soon as Kive is launched should be added to this file.
 * 
 */

var path = require("path");

// ***** Global variable that stores guid of current workspace
var currentWorkspace = null;
var workspaceQueues = {};

// ***** Global variable that stores OS
// var OS = getOS();

var remote = require('electron').remote;
var fs = remote.require('fs');
var dialog = remote.dialog;
var shell = require('electron').shell;

// Path to kive_data folder
var appDataPath = remote.getGlobal('sharedObject').appDataPath;
var platform = remote.getGlobal('sharedObject').platform;

// Called on body onload
function onLoad() {
    console.log('read_tree called');

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
