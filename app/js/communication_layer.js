const fetch = require("node-fetch")

function create_workspace(name) {
    let fetch = require("node-fetch")
    fetch() // insert endpoint
    .then(json => {
        console.log(json)
    })
    .catch(err => {
        // Do something for an error here
        console.log('Error')
    })
}

function delete_workspace(guid) {
    let fetch = require("node-fetch")
    fetch() // insert endpoint
    .then(json => {
        console.log(json)
    })
    .catch(err => {
        // Do something for an error here
        console.log('Error')
    })
}