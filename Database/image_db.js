const dotenv = require("dotenv");
dotenv.config();

const { MongoClient } = require('mongodb');
const dbName = process.env.MONGO_DBNAME;


// ref source code: https://gist.github.com/adityaparmar03/3039afbf1403abd00e26b6715ad6cf41
initMongodb = async() => {
    try {
        client = await MongoClient.connect(process.env.MONGO_URL);
        db = client.db(dbName);
        return db
    } catch (err) {
        console.log(err);
    }
}
module.exports = {
    initMongodb
};