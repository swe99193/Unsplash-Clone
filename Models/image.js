const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectId;

const imageSchema = new mongoose.Schema({
    filename: String,
    metadata: {
        name: String,
        desc: String,
        owner: String,
        tags: String,
        likes: Number
    }
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model("Image", imageSchema, 'images.files');