
// Writes to htmlFile (for annotations)
function saveHtmlFile() {
    console.log("write file called");
    let remote = require('electron').remote;
    let dialog = remote.dialog;
    let fs = remote.require('fs');

    // Gets iframe doc and html
    let iframe = document.getElementById("html_disp");
    let doc = iframe.contentDocument? iframe.contentDocument: iframe.contentWindow.document;
    let htmlString = doc.documentElement.innerHTML;

    // Writes html from iframe to file
    fs.writeFile(open_files, htmlString, (err) => { // writes to file that is open in iframe
        if (err) {
            alert("An error ocurred updating the file" + err.message);
            console.log(err);
            return;
        }

        alert("The file has been succesfully saved");
    });
}

function rmvH1() {
      let iframe = document.getElementById("html_disp");
      /*let h1_elmnts = iframe.contentWindow.document.getElementsByTagName("H1");
      let x = 0;
      for (x=0; x<h1_elmnts.length; x++) {
        h1_elmnts[x].style.display = "none";
      }*/
      let doc = iframe.contentDocument? iframe.contentDocument: iframe.contentWindow.document;
      let h1_elem = doc.getElementsByTagName("H1")[0];
      //alert(h1_elem);
      h1_elem.style.color = "red";
      h1_elem.onclick=function(){/*alert(h1_elem.innerHTML)*/; h1_elem.style.color = "purple"; h1_elem.style.backgroundColor = "yellow";};
}

function getSelectionHtml() {
    let iframe = document.getElementById("html_disp");
      let doc = iframe.contentDocument? iframe.contentDocument: iframe.contentWindow.document;
      let selection = '';
      if (doc.getSelection) {
        selection = doc.getSelection();
        alert(selection);
      }
      var all = doc.getElementsByTagName("*");

      for (var i=0, max=all.length; i < max; i++) {
        if(all[i].innerText && all[i].children.length == 0) {
            if (all[i].innerText.includes(selection)) {
                all[i].style.color = "pink";
                console.log(all[i].innerText);
            }
        }
      }
}

function getMouse(event) {
    let iframe = document.getElementById("html_disp");
    let doc = iframe.contentDocument? iframe.contentDocument: iframe.contentWindow.document;
    alert(event.clientX+" "+event.clientY);
    let noteElem = doc.createElement("H1");
    let textNode = doc.createTextNode("Note is here look.");
    noteElem.appendChild(textNode);
    doc.body.appendChild(noteElem);
    //noteElem.style.all = "unset";
    noteElem.style.position = "absolute";
    noteElem.style.left = event.clientX;
    noteElem.style.top = event.clientY;
    noteElem.style.zIndex = "10000";
}

function addText() {
    let iframe = document.getElementById("html_disp");
    let doc = iframe.contentDocument? iframe.contentDocument: iframe.contentWindow.document;
    doc.addEventListener('click', getMouse);

}