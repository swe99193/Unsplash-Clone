/** this module contains all image APIs.
 * e.g., upload, search, likes. 
 */

const dotenv = require("dotenv");
dotenv.config();

const { GridFSBucket } = require('mongodb');
const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectId;
const path = require("path");
const fs = require('fs');

const { esclient } = require("../Database/es")
const { initMongodb } = require('../Database/image_db');
const imgModel = require('../Models/image')
const likesModel = require('../Models/likes')
const userModel = require('../Models/user')


/* initialize GridGS Bucket (MongoDB), bucket will be shared among APIs */
var bucket;
const esIndexName = process.env.ES_ImageIndexName;

// Note: comment out this connection
//      this connection is only for testing, connection will be initiated at app.js
// mongoose.connect(
//         process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }
//     )
//     .then(() => console.log('mongodb connected:', process.env.MONGO_DBNAME))
//     .catch(err => console.log(err));


/** initialize GridFS Bucket (MongoDB) */
(async() => {
    try {
        db = await initMongodb();
        bucket = new GridFSBucket(db, { bucketName: 'images' });
        console.log('create GridFSBucket: true');

        // Note: You can test query here

        // const cursor = bucket.find({});
        // const cursor = bucket.find({ 'metadata.name': 'smile face' });
        // const cursor = bucket.find({ _id: ObjectId('6331c64d17804dc42c0dc7c3') });
        // cursor.forEach(doc => console.log(doc));
        // bucket.delete(ObjectId("6342260c2f3ed325e7d44670"));
        // bucket.delete(ObjectId("63359ad23655f08c79defe29"));
        // bucket.delete(ObjectId("6331c64d17804dc42c0dc7c3"));
        // bucket.delete(ObjectId("6331c61d4c626f825e8ef155"));
        // bucket.delete(ObjectId("6331c5ac2b7567c546eba62f"));
        // bucket.delete(ObjectId("6331bd72acf2f287641bfa77"));
    } catch (err) {
        console.log(err);
    }
})();


// initialize index (table) in ES
(async() => {
    try {
        const exists = await esclient.indices.exists({
            index: esIndexName
        });
        console.log('ES Index', '\"' + esIndexName + '\"', 'exists:', exists);
        if (!exists) {
            await esclient.indices.create({
                index: esIndexName
            });
        }

        // Note: You can test query here

        // insert a new document (ElasticSearch)
        // await esclient.create({
        //     index: esIndexName,
        //     id: '63359ad23655f08c79defe29', // use result.id to get String type (instead of _id)
        //     document: {
        //         'tags': 'happy'
        //     }
        // });
        // await esclient.update({
        //     index: esIndexName,
        //     id: '63359ad23655f08c79defe29', // use result.id to get String type (instead of _id)
        //     doc: {
        //         'tags': 'happy'
        //     }
        // });
        // await esclient.delete({
        //     index: esIndexName,
        //     id: '63359ad23655f08c79defe29'
        // });
    } catch (err) {
        console.log(err);
    }
})();



/**
 * helper function
 * full-text search on image tags (elasticsearch)
 */
async function _search_img_by_tag(keyword) {
    const document = await esclient.search({
        index: esIndexName,
        "query": {
            "match": {
                "tags": {
                    "query": keyword,
                    "fuzziness": "AUTO"
                }
            }
        }
    });

    const img_id_list = [];
    const arr = document.hits.hits;

    for (let x of arr) {
        img_id_list.push(x._id);
    }
    return img_id_list
};

/**
 * full-text search (ES) on tag, and return image IDs & metadata
 */
async function searchImage(req, res) {
    try {
        const img_id = await _search_img_by_tag(req.query.search_query); // return a list of image id

        // load images listed in image id (Mongodb),
        const result = await imgModel.find({
            '_id': {
                $in: img_id
            }
        }, {
            _id: true,
            metadata: true
        });

        // send result to client
        // res.json({
        //     'result': result
        // });
        var username = req.session.username;
        var loginBtn = (!req.session.loggedin) ? "block" : "none";
        var logoutBtn = (req.session.loggedin) ? "block" : "none";

        res.render("mainPage", { images: result, loginBtn: loginBtn, logoutBtn: logoutBtn, username: username });

        console.log('[LOG] Done search result.');
        console.log(img_id);

    } catch (err) {
        console.log(err);
        res.status(500).send("A server error occurred");
    }
}

/**
 * send an image file to client (MongoDB), 
 * this function handle one file every time it is called
 */
async function fetchImage(req, res) {
    try {
        const id = req.params.id;
        // console.log("query id:", id);
        const filePath = path.join(__dirname, '..', 'Images', id) + '.jpg';

        // if the file is not loaded, download from MongoDB
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
            console.log('[LOG] Done sending image file to Client.');
        } else {
            bucket.openDownloadStream(ObjectId(id)).
            pipe(fs.createWriteStream(filePath)).
            on('finish', () => {
                res.sendFile(filePath);
                console.log('[LOG] Done sending image file to Client.');
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("A server error occurred");
    }
}

/**
 * show a image page
 */
async function showImage(req, res) {
    try {
        const id = req.params.id;
        const result = await imgModel.findById(id, {
            _id: true,
            'metadata': true
        });

        var username = (req.session.username);

        const user = await userModel.findOne({ username: result.metadata.owner }, { name: true });

        if (username !== null)
            var is_liked = await likesModel.findOne({ imgId: id, username: username });
        else
            var is_liked = null;

        is_liked = (is_liked !== null);

        var username = req.session.username;
        var loginBtn = (!req.session.loggedin) ? "block" : "none";
        var logoutBtn = (req.session.loggedin) ? "block" : "none";

        res.render("image", { image: result, ownername: user.name, is_liked: is_liked, loginBtn: loginBtn, logoutBtn: logoutBtn, username: username });

    } catch (error) {
        console.log(error);
        res.status(500).send("A server error occurred");
    }
}


/**
 * increment iamge likes 
 */
async function updateLikes(req, res) {
    try {
        // check login status
        if (!req.session.loggedin || !req.session.username) {
            // request login
            res.status(200).send("false");
            return
        }

        var num; // increment or decrement, add or remove like
        num = (req.body.like_action == "true") ? 1 : -1;

        const id = req.body.id;
        const username = req.session.username;

        // likes increment or decrement
        await imgModel.findByIdAndUpdate(id, {
            $inc: {
                'metadata.likes': num
            }
        });

        // update likesModel
        if (num == 1) {
            result = await likesModel.findOne({ imgId: id, username: username });
            if (result === null)
                await likesModel.create({ imgId: id, username: username });
        } else
            await likesModel.deleteOne({ imgId: id, username: username });

        console.log('[LOG] Done updating likes in MongoDB');
        res.status(200).send("true");

    } catch (err) {
        console.log(err);
        res.status(500).send("A server error occurred");
    }
}

/**
 * return image likes
 */
// async function getLikes(req, res) {
//     // console.log("query id: " + req.query.id);
//     try {
//         const result = await imgModel.findById(req.query.id, {
//             'metadata.likes': true
//         });
//         // console.log("[QUERY] " + result);

//         // send to client
//         res.json({
//             'likes': result.metadata.likes
//         });

//     } catch (err) {
//         console.log(err);
//         res.status(500).send("A server error occurred");
//     }
// }

function uploadPage(req, res) {
    // check login status
    if (!req.session.loggedin || !req.session.username) {
        // request login
        res.redirect('/login');
    } else {
        var username = req.session.username;
        var loginBtn = (!req.session.loggedin) ? "block" : "none";
        var logoutBtn = (req.session.loggedin) ? "block" : "none";

        res.render("uploadPage", { loginBtn: loginBtn, logoutBtn: logoutBtn, username: username });
    }
}

async function uploadImage(req, res) {
    try {
        // check login status
        if (!req.session.loggedin || !req.session.username) {
            // request login
            res.redirect('/login');
            return
        }

        const filePath = path.join(__dirname, '..', "uploads", req.file.filename);

        // insert new image (MongoDB)
        fs.createReadStream(filePath).
        pipe(bucket.openUploadStream(req.file.filename, {
            metadata: {
                name: req.body.name,
                desc: req.body.desc,
                owner: req.session.username, // require login session
                tags: req.body.tags,
                likes: 0 // default value = 0
            }
        })).
        on('finish', async() => {
            console.log('[LOG] Done inserting data to MongoDB');

            // retrieve id (MongoDB)
            const result = await imgModel.findOne({
                filename: req.file.filename,
                metadata: {
                    name: req.body.name,
                    desc: req.body.desc,
                    owner: req.session.username,
                    tags: req.body.tags,
                    likes: 0
                }
            }, { _id: true });

            // insert a new document (ElasticSearch)
            esclient.create({
                index: esIndexName,
                id: result.id, // use result.id to get String type (instead of _id)
                document: {
                    'tags': req.body.tags
                }
            });
            console.log('[LOG] Done inserting data to ES');


            // finall response to client
            res.status(200).send("Successfully upload image!");

            // delete temp storage at /uploads
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(err)
                    return
                }
            })
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("A server error occurred");
    }
}


/**
 * return image metadata, e.g., name, description, tags
 */
async function getImageInfo(req, res) {
    try {
        const result = await imgModel.findById(req.params.id, {
            _id: true,
            'metadata': true
        });
        // console.log("[QUERY] " + result);
        var username = req.session.username;
        var loginBtn = (!req.session.loggedin) ? "block" : "none";
        var logoutBtn = (req.session.loggedin) ? "block" : "none";
        // res.json({ 'metadata': result.metadata });
        res.render("editImage", { image: result, loginBtn: loginBtn, logoutBtn: logoutBtn, username: username });

    } catch (err) {
        console.log(err);
        res.status(500).send("A server error occurred");
    }
}

/**
 * update image metadata, e.g., name, description, tags
 */
async function updateImage(req, res) {
    try {
        // check login status
        if (!req.session.loggedin || !req.session.username) {
            // request login
            res.redirect('/login');
            return
        }

        const id = req.body.id;

        const result = await imgModel.findById(id, {
            'metadata': true
        });

        // a user try to access other users' resources
        if (result.metadata.owner != req.session.username) {
            res.status(403).send("Access Denied.");
            return
        }

        // update image metadata (MongoDB)
        await imgModel.findByIdAndUpdate(id, {
            $set: {
                'metadata.name': req.body.name,
                'metadata.desc': req.body.desc,
                'metadata.tags': req.body.tags,
            }
        });
        console.log('[LOG] Done updating data in MongoDB');

        // update image tags (ES)
        esclient.update({
            index: esIndexName,
            id: id,
            doc: {
                'tags': req.body.tags
            }
        });
        console.log('[LOG] Done updating data in ES');

        res.status(200).send("Successfully update image info.");

    } catch (err) {
        console.log(err);
        res.status(500).send("A server error occurred");
    }
}


/**
 * delete image
 */
async function deleteImage(req, res) {
    try {
        // check login status
        if (!req.session.loggedin || !req.session.username) {
            // request login
            res.redirect('/login');
            return
        }
        // a user try to access other users' resources
        if (req.body.metadata.owner != req.session.username) {
            res.status(403).send("Access Denied.");
            return
        }

        const id = req.body.id;

        // delete (MongoDB)
        bucket.delete(ObjectId(id));
        console.log('[LOG] Done deleting data in MongoDB');

        // clear all likes
        await likesModel.deleteMany({ imgId: id });

        // delete (ElasticSearch)
        esclient.delete({
            index: esIndexName,
            id: req.body.id
        });
        console.log('[LOG] Done deleting data in ES');


        res.status(200).send("The image is deleted.");

    } catch (err) {
        console.log(err);
        res.status(500).send("A server error occurred");
    }
}


async function externalJs(req, res) {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '..', 'public', 'js', filename);
        res.sendFile(filePath);

    } catch (error) {
        console.log(error);
        res.status(500).send("A server error occurred");
    }
}

async function favicon(req, res) {
    try {
        const filePath = path.join(__dirname, '..', 'public', 'img', 'favicon.ico');
        res.sendFile(filePath);

    } catch (error) {
        console.log(error);
        res.status(500).send("A server error occurred");
    }
}

module.exports = {
    searchImage,
    fetchImage,
    showImage,
    updateLikes,
    // getLikes,
    uploadPage,
    uploadImage,
    getImageInfo,
    updateImage,
    deleteImage,
    externalJs,
    favicon
};