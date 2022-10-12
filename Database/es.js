// this module return a connected elasticsearch Client

const dotenv = require("dotenv");
dotenv.config();
const { Client } = require('@elastic/elasticsearch')
const fs = require('fs');

// ref: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-connecting.html#connect-self-managed-new
const esclient = new Client({
    node: process.env.ES_URL,
    auth: {
        username: process.env.ES_USER,
        password: process.env.ES_PASSWORD
    },

    // get CA command: docker cp <container_name>:/usr/share/elasticsearch/config/certs/http_ca.crt .
    tls: {
        ca: fs.readFileSync('./http_ca.crt'),
        rejectUnauthorized: false
    }
});



/* testing snippets */

// search API
// (async() => {
//     await checkConnection();

//     const document = await esclient.search({
//         index: 'test-index',
//         "query": {
//             "match": {
//                 "message": {
//                     "query": "documents",
//                     "fuzziness": "AUTO"
//                 }
//             }
//         }
//     });
//     console.log(document.hits.hits);

// })();


// function checkConnection() {
//     return new Promise(async(resolve) => {

//         console.log("Checking connection to ElasticSearch...");

//         let isConnected = false;

//         while (!isConnected) {

//             try {
//                 await esclient.cluster.health({});
//                 console.log("Successfully connected to ElasticSearch");
//                 isConnected = true;
//                 // eslint-disable-next-line no-empty
//             } catch (err) {
//                 console.log(err)
//             }
//         }

//         resolve(true);

//     });
// }



module.exports = {
    esclient
};