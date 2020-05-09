
// Opens a modal (takes modal type, list of prompts, and a function to be called on confirmation -> ie clicking "ok")
function openModal(type, title, prompts, func) {
    // Get all html parts of the modal
    let modalBase = document.getElementById("modal");
    let modalHeader = modalBase.getElementsByClassName("modal-header")[0];
    let modalBody = modalBase.getElementsByClassName("modal-body")[0];
    let modalFooter = modalBase.getElementsByClassName("modal-footer")[0];
    let modalTitle = modalBase.getElementsByClassName("modal-title")[0];

    // Clears modal content
    modalBody.innerHTML = "";
    modalFooter.innerHTML = "";

    // Sets modal header to title passed in
    modalTitle.innerHTML = title;

    // Adds elements to modal based on passed-in type
    // Single input modal
    if (type == "single-input") {
        // Label for input
        let label = document.createElement("LABEL");
        label.appendChild(document.createTextNode(prompts[0]));
        modalBody.appendChild(label);
        // Input
        let input = null;
        input = document.createElement("INPUT");
        input.type = "text";
        modalBody.appendChild(input);
        // Create affirmation and cancel buttons
        let affirmBtn = document.createElement("BUTTON");
        // Calls function passed in on input value
        affirmBtn.onclick = function () { func(input.value); $("#modal").modal("toggle"); };
        affirmBtn.appendChild(document.createTextNode("OK"));
        affirmBtn.className = "btn btn-success";
        modalFooter.appendChild(affirmBtn);
    }
    // Confirmation modal
    if (type == "confirmation") {
        // Label for confirmation
        let label = document.createElement("LABEL");
        label.appendChild(document.createTextNode(prompts[0]));
        modalBody.appendChild(label);
        // Create affirmation and cancel buttons
        let affirmBtn = document.createElement("BUTTON");
        // Calls function passed in on input value
        affirmBtn.onclick = function () { func(); $("#modal").modal("toggle"); };
        affirmBtn.appendChild(document.createTextNode("Yes"));
        affirmBtn.className = "btn btn-success";
        modalFooter.appendChild(affirmBtn);

    }
    // Get Info for a Node
    if (type == "get-info") {
        let n = prompts[0]
        let contents = document.createElement("UL");
        contents.style.wordWrap = "break-word";
        contents.style.listStyle = "none";
        contents.style.paddingLeft = "0px";

        // Name
        let nameEl = document.createElement('LI');
        let nameLabel = document.createElement("B");
        nameLabel.appendChild(document.createTextNode("Name: "));
        nameEl.appendChild(nameLabel)
        nameEl.appendChild(document.createTextNode(n.name));
        contents.appendChild(nameEl);

        // Source
        if (n.source) {
            let sourceEl = document.createElement('LI');
            let sourceLabel = document.createElement("B");
            sourceLabel.appendChild(document.createTextNode("Source: "));
            sourceEl.appendChild(sourceLabel);
            let italicSrc = document.createElement("I");
            italicSrc.appendChild(document.createTextNode(n.source));
            sourceEl.appendChild(italicSrc);
            contents.appendChild(sourceEl);
        }

        // Path
        let pathEl = document.createElement('LI');
        let pathLabel = document.createElement("B");
        pathLabel.appendChild(document.createTextNode("Path: "));
        pathEl.appendChild(pathLabel);
        pathEl.appendChild(document.createTextNode(n.path));
        contents.appendChild(pathEl);

        // Legacy Ingest Date
        if (n.legacy_ingest) {
            let legacyEl = document.createElement('LI');
            let legacyLabel = document.createElement("B");
            legacyLabel.appendChild(document.createTextNode("Legacy Platform Ingest Date: "));
            legacyEl.appendChild(legacyLabel)
            legacyEl.appendChild(document.createTextNode(formatDate(n.legacy_ingest)));
            contents.appendChild(legacyEl);
        }

        // Kive Ingest Date
        let kiveEl = document.createElement('LI');
        let kiveLabel = document.createElement("B");
        kiveLabel.appendChild(document.createTextNode("Kive Ingest Date: "));
        kiveEl.appendChild(kiveLabel)
        kiveEl.appendChild(document.createTextNode(formatDate(n.ingest)));
        contents.appendChild(kiveEl);

        // Last Accessed Date
        let accessedEl = document.createElement('LI');
        let accessedLabel = document.createElement("B");
        accessedLabel.appendChild(document.createTextNode("Last Accesssed Date: "));
        accessedEl.appendChild(accessedLabel)
        accessedEl.appendChild(document.createTextNode(formatDate(n.last_accessed)));
        contents.appendChild(accessedEl);

        modalBody.appendChild(contents)
    }

    // Invalid Search Date-Range Modal
    if (type == "search-query-error") {
        let contents = document.createElement("DIV");
        contents.style.wordWrap = "break-word";

        // Error Message
        let errorMessage = document.createElement("B");
        errorMessage.appendChild(document.createTextNode("ERROR: Invalid Date Range"));
        contents.appendChild(errorMessage)

        modalBody.appendChild(contents)
    }

    // Find lost file/folder modal
    if (type == "find-lost-file") {
        // Label for input
        /*let label = document.createElement("LABEL");
        label.appendChild(document.createTextNode(prompts[0]));
        modalBody.appendChild(label);*/
        // Input
        let chooseFile = document.createElement("BUTTON");
        chooseFile.onclick = function () { chooseFilePath(func); }
        chooseFile.appendChild(document.createTextNode(prompts[0]));
        modalBody.appendChild(chooseFile);
    }

    if (type == "import-options-info") {
        let contents = document.createElement("DIV");
        contents.style.wordWrap = "break-word";

        // Import file options
        let fileLabel = document.createElement("B");
        fileLabel.appendChild(document.createTextNode("Import File: "));
        contents.appendChild(fileLabel)
        contents.appendChild(document.createTextNode("Kive supports .html and .htm files"));
        contents.appendChild(document.createElement("br"));

        // Import folder options
        let folderLabel = document.createElement("B");
        folderLabel.appendChild(document.createTextNode("Import Folder: "));
        contents.appendChild(folderLabel)
        contents.appendChild(document.createTextNode("Kive will find all relative webpage files within this directory while retaining structure"));
        contents.appendChild(document.createElement("br"));

        // Import WebScrapBook options
        let wsbLabel = document.createElement("B");
        wsbLabel.appendChild(document.createTextNode("Import WebScrapBook: "));
        contents.appendChild(wsbLabel)
        contents.appendChild(document.createTextNode("Select a WebScrapBook repository folder that contains a data/ folder. If the tree/ folder is also available, Kive will retain structure"));
        contents.appendChild(document.createElement("br"));

        // Import ScrapBook options
        let sbLabel = document.createElement("B");
        sbLabel.appendChild(document.createTextNode("Import ScrapBook: "));
        contents.appendChild(sbLabel)
        contents.appendChild(document.createTextNode("Select a ScrapBook repository folder that contains a data/ folder. If the .rdf file is also available, Kive will retain structure"));
        contents.appendChild(document.createElement("br"));

        modalBody.appendChild(contents)
    }

    if (type == "scrape-url") {
        let contents = document.createElement("DIV");
        contents.style.wordWrap = "break-word";

        // URL Message
        let urlMessage = document.createElement("P");
        urlMessage.appendChild(document.createTextNode("Would you like Kivé to search imported files for a source URL? This will allow a URL to be displayed on hover and icons to be retrieved from the web, however may significantly increase time taken to build the file tree."));
        contents.appendChild(urlMessage)

        modalBody.appendChild(contents)

         // Create affirmation and cancel buttons
         let affirmBtn = document.createElement("BUTTON");
         // Calls function passed in on input value
         affirmBtn.onclick = function () { func("folder_url"); $("#modal").modal("toggle"); };
         affirmBtn.appendChild(document.createTextNode("Yes"));
         affirmBtn.className = "btn btn-success";
         modalFooter.appendChild(affirmBtn);

         let denyBtn = document.createElement("BUTTON");
         // Calls function passed in on input value
         denyBtn.onclick = function () { func("folder"); $("#modal").modal("toggle"); };
         denyBtn.appendChild(document.createTextNode("No"));
         denyBtn.className = "btn btn-danger";
         modalFooter.appendChild(denyBtn);

    }


    
    let cancelBtn = document.createElement("BUTTON");
    cancelBtn.appendChild(document.createTextNode("Cancel"));
    cancelBtn.onclick = function () { $("#modal").modal("toggle"); };
    cancelBtn.className = "btn btn-danger";

    // Add buttons to footer if not scrape-url
    if (type != "scrape-url") {
        modalFooter.appendChild(cancelBtn);
    }
    

    // Opens modal
    $("#modal").modal("toggle");
}

// Formats date for display
function formatDate(dateStr) {
    let year = dateStr.substring(0, 4);
    let month = dateStr.substring(4, 6);
    let day = dateStr.substring(6, 8);
    return month + "/" + day + "/" + year;
}

// Retrieve selected file
function chooseFilePath(func) {
    console.log('chooseFilePath called');

    dialog.showOpenDialog({
        title: "Select a file",
        properties: ['openFile'],
        filters: [{
            name: 'Entries',
            extensions: ['htm', 'html']
        }]
    }).then(folderPaths => {
        // folderPaths is an array that contains all the selected paths
        if (folderPaths.filePaths === undefined || folderPaths.filePaths == "") {
            console.log("No destination folder selected");
            return;
        }
        else {
            $("#modal").modal("toggle");
            func(folderPaths.filePaths[0]);
        }
    });
}