const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectId;

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    oauth: String,
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model("user", userSchema, 'user');