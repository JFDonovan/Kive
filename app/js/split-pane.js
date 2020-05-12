/**
 * 
 * Summary. 
 * 
 * This file contains the logic for listening to the dragging of Kive's vertical divider
 * and adjusting the size of the left pane in relation to the right pane as necessary.
 * 
 */

 // Adds listener for DOM content finished loading
document.addEventListener('DOMContentLoaded', function () {
    var handle = document.getElementById("split_handle");
    // Adds listener to handle of split panes
    handle.addEventListener('mousedown', function (mdEvent) {
        // Disables scrolling for tree display while resizing (bug fix)
        document.getElementById("tree_display").style.overflowX = "hidden";
        // Sets html display (iframe/webview) to not have pointer events
        document.getElementById('html_disp').style.pointerEvents = 'none';
        mouseDragCount = 0;
        // Adds listener for mouse move and calls function to handle drag
        document.addEventListener('mousemove', handleDrag, true);
        // Adds listener for mosue up event
        document.addEventListener('mouseup', function (muEvent) {
            // Reverts tree display to be scrollable
            document.getElementById("tree_display").style.overflowX = "auto";
            // Less taxing to update tabs here
            //chromeTabs.layoutTabs();
            // Removes listeners
            document.removeEventListener('mousemove', handleDrag, true);
            document.getElementById('html_disp').style.pointerEvents = 'auto';
        });
    });

});

// Handnles mouse drag while holding down on handle
function handleDrag(event) {
    var explorePanel = document.getElementById("explore_panel"),
        renderPanel = document.getElementById("render_panel"),
        handle = document.getElementById("split_handle");
    // Sets limits to sizes of panes
    if (event.clientX < window.innerWidth - 10 && event.clientX > 200) {
        // Resizes panes based on mouse position
        handle.style.left = 100 * (event.clientX / window.innerWidth) + '%';
        explorePanel.style.width = 100 * (event.clientX / window.innerWidth) + '%';
        renderPanel.style.width = 100 * ((window.innerWidth - event.clientX) / window.innerWidth) + '%';
        // More taxing to update tabs here (updates tab sizes)
        chromeTabs.layoutTabs();
    }
}
