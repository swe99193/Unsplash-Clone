const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    _id: String,
    expires: Date,
    session: Object
});

// Note: Collection name is the third argument instead of the first one.
module.exports = new mongoose.model("Session Store", sessionSchema, 'session');