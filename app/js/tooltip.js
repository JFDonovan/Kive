
// Global variable for timeout for hover detection
var delay = null;


// Adds tooltip listeners to all jqtree nodes in the DOM
function addTreeTooltips(workspace) {
    let titles = document.getElementsByClassName("jqtree-element"); // jqtree-title (alt)
    for (let x = 0; x < titles.length; x++) {
        titles[x].onmousemove = function (e) {
            // Clears global timeout on move
            if (delay) {
                clearTimeout(delay);
            }
            // Begins new timeout
            delay = setTimeout(function () {
                // Gets the node corresponding to the element
                let node = $('#' + workspace + '_tree').tree('getNodeByHtmlElement', e.target);
                // Sets content for tooltip
                let content = [node.name];
                if (node.source) {
                    content.push("(" + node.source + ")");
                }
                content.push("(www.example.com)"); // TEMPORARY EXAMPLE
                // Spawns popup for tooltip
                spawnTooltip(e, content);
            }, 600)
        }
        // Prevents spawning of tooltip if hover breaks
        titles[x].onmouseleave = function (e) {
            if (delay) {
                console.log("THAT CASE");
                clearTimeout(delay);
            }
        }
    }
}

// Spawns tooltip popup
function spawnTooltip(event, textList) {
    let tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = "";
    console.log("spawn tooltip CALLED " + textList);
    // Sets content to passed in texts
    let list = document.createElement("UL");
    for (let x = 0; x < textList.length; x ++) {
        let item = document.createElement("LI");
        item.appendChild(document.createTextNode(textList[x]));
        list.appendChild(item);
    }
    tooltip.appendChild(list);
    // Gets mouse position for tooltip positioning
    let posX = event.pageX;
    let posY = event.pageY;
    // Sets tooptip position
    tooltip.style.top = posY + "px";
    tooltip.style.left = posX + "px";

    // Shows tool tip
    tooltip.classList.remove("hidden");
    tooltip.classList.add("fadein");
    // Makes it so that moving mouse inside iframe despawns tooltip
    document.getElementById("html_disp").style.pointerEvents = "none";
    // Create listeners for events that despawn tooltip
    document.addEventListener('mousemove', despawnTooltip);
    document.addEventListener('scroll', despawnTooltip, true);
}

// Despawns tooltip popup
function despawnTooltip() {
    console.log("despawn tooltip CALLED");
    let tooltip = document.getElementById("tooltip");
    // Hides tooltip
    tooltip.classList.add("hidden");
    tooltip.classList.remove("fadein");
    // re-enables mouse events for iframe
    document.getElementById("html_disp").style.pointerEvents = "auto";
    // Deletes listeners to prevent memory (shouldn't happen anyway but good practice)
    document.removeEventListener('mousemove', despawnTooltip);
    document.removeEventListener('scroll', despawnTooltip, true);
}