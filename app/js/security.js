/**
 * 
 * Summary. 
 * 
 * This file works to encrypt and decrypt messages moving accross our middleware layer.
 * 
 * Although this has not been integrated into Kive, this functionality would be very useful and
 * is of high priority moving forward.
 * 
 */

function getToken() {
    let fernet = require('fernet');

    let path = appDataPath + "/secret_key";

    fs.readFile(path, 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
        }
        let secret = new fernet.Secret(data);
        console.log(secret);
        let token = new fernet.Token({
            secret: secret
            //time: Date.parse(1),
            //iv: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        });
        return token;
    });
}

function encryptRequest(message) {
    token.encode(message);
}

function decryptResponse(message) {
    token.decode(message);
}
