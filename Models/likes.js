const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectId;

const likesSchema = new mongoose.Schema({
    imgId: String,
    username: String,
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model("likes", likesSchema, 'likes');