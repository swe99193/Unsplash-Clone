/** this module maintains all routes related to user.
 * e.g., account management
 */

const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const path = require('path');
const routes = express.Router();
const fs = require('fs');

const userModel = require('../Models/user')
const imgModel = require('../Models/image')


// account management
routes.get("/account", async(req, res) => {
    try {
        // check login status
        if (!req.session.loggedin || !req.session.username) {
            // request login
            res.redirect('/login');
            return
        }
        const username = req.session.username;
        const user = await userModel.findOne({
            username: username
        });

        var loginBtn = (!req.session.loggedin) ? "block" : "none";
        var logoutBtn = (req.session.loggedin) ? "block" : "none";

        res.render("account", { user: user, loginBtn: loginBtn, logoutBtn: logoutBtn, username: username });

    } catch (err) {
        console.log(err);
        res.status(500).send("A server error occurred");
    }
});

// update account name
routes.post("/account", async(req, res) => {
    try {
        // check login status
        if (!req.session.loggedin || !req.session.username) {
            // request login
            res.redirect('/login');
            return
        }

        await userModel.updateOne({ username: req.session.username }, {
            $set: {
                name: req.body.name
            }
        });
        res.status(200).send("Successfully update account info.");

    } catch (err) {
        console.log(err);
        res.status(500).send("A server error occurred");
    }
});

// manage uploaded images
routes.get("/images", async(req, res) => {
    try {
        // check login status
        if (!req.session.loggedin || !req.session.username) {
            // request login
            res.redirect('/login');
            return
        }

        var result = await imgModel.find({
            "metadata.owner": req.session.username
        }, {
            _id: true,
            metadata: true
        });

        var username = req.session.username;
        var loginBtn = (!req.session.loggedin) ? "block" : "none";
        var logoutBtn = (req.session.loggedin) ? "block" : "none";

        res.render("uploadedImage", { images: result, loginBtn: loginBtn, logoutBtn: logoutBtn, username: username });

    } catch (err) {
        console.log(err);
        res.status(500).send("A server error occurred");
    }
});

module.exports = routes;