/** this module maintains all routes related to images.
 * e.g., upload, search, render. 
 */

const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const path = require('path');
const routes = express.Router();
const multer = require("multer");
const fs = require('fs');

const { searchImage, fetchImage, showImage, updateLikes, uploadPage, uploadImage, getImageInfo, updateImage, deleteImage, externalJs, favicon } = require("../Controllers/ImageController")


// (multer) configure storage destination & filename
// https://www.npmjs.com/package/multer
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

routes.get("/js/:filename", externalJs);
routes.get("/favicon", favicon);

// upload
routes.get("/upload", uploadPage);

routes.post("/upload", upload.single("image"), uploadImage);


// search function
routes.post("/search", (req, res) => {
    // res.send(req.body);
    const search_query = "search_query=".concat(req.body.search_query);
    const query_string = "/search?".concat(search_query);
    res.redirect(query_string);
});

// render search result (this API returns metadata, and then the frontend fetches image files from server through the route /data/files)
routes.get("/search", searchImage);

// load image file
routes.get("/data/files/:id", fetchImage);

routes.get("/:id", showImage);

// return image metadata
routes.get("/data/metadata/:id", getImageInfo);

// update image metadata
routes.post("/data/metadata/:id", updateImage);

// delete image
routes.delete("/data", deleteImage);


// update likes of an image
routes.post("/data/likes", updateLikes);

// get likes of an image
// routes.get("/data/likes", getLikes);

module.exports = routes;