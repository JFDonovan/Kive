/**
 * 
 * Summary. 
 * 
 * This file contains the logic for listening to the dragging of Kive's vertical divider
 * and adjusting the size of the left pane in relation to the right pane as necessary.
 * 
 */

document.addEventListener('DOMContentLoaded', function () {
    var handle = document.getElementById("split_handle");

    handle.addEventListener('mousedown', function (mdEvent) {
        document.getElementById("tree_display").style.overflowX = "hidden";
        document.getElementById('html_disp').style.pointerEvents = 'none';
        mouseDragCount = 0;
        document.addEventListener('mousemove', handleDrag, true);
        document.addEventListener('mouseup', function (muEvent) {
            document.getElementById("tree_display").style.overflowX = "auto";
            // Less taxing to update tabs here
            //chromeTabs.layoutTabs();
            document.removeEventListener('mousemove', handleDrag, true);
            document.getElementById('html_disp').style.pointerEvents = 'auto';
        });
    });

});

function handleDrag(event) {
    var explorePanel = document.getElementById("explore_panel"),
        renderPanel = document.getElementById("render_panel"),
        handle = document.getElementById("split_handle");
    if (event.clientX < window.innerWidth - 10 && event.clientX > 200) {
        handle.style.left = 100 * (event.clientX / window.innerWidth) + '%';
        explorePanel.style.width = 100 * (event.clientX / window.innerWidth) + '%';
        renderPanel.style.width = 100 * ((window.innerWidth - event.clientX) / window.innerWidth) + '%';
        // More taxing to update tabs here
        chromeTabs.layoutTabs();
    }
}
