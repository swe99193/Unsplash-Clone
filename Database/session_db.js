const dotenv = require("dotenv");
const session = require("express-session");
dotenv.config();

var mongoose = require("mongoose");
const sessionModel = require("../Models/session");

mongoose.connect(
    process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        console.log("Mongo session db connected");
    }
);

/**
 *  check if the given session exists in session store (mongoDB)
 *  return the session user
 */
async function session_user(sessionID) {
    try {
        var result = await sessionModel.findById(sessionID);
    } catch (error) {
        console.log("Error: " + error);
        result = "error";
    } finally {
        return result
    }
};

module.exports = {
    session_user
};