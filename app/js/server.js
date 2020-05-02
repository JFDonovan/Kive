// Shuts server down
module.exports = {
    shutdown: () => { console.log('shutdown server called'), test('shutdown/') }
}

// Makes POST request at endpoint at path
function getRequest(path) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            handleResponse(xhttp.responseText);
        }
    };
    xhttp.open("GET", "http://localhost:5000/" + path, true);
    xhttp.send();
}

// Makes POST request at endpoint at path
function postRequest(path) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            handleResponse(xhttp.responseText);
        }
    };
    xhttp.open("POST", "http://localhost:5000/" + path, true);
    xhttp.send();
}

function handleResponse(response) {
    alert(response);
}