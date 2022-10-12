const express = require('express');
const path = require('path');
const { oauth_initialization, process_oauth_response } = require("../Controllers/LoginController")
const routes = express.Router();
const { session_user } = require("../Database/session_db")

// Login main entry
routes.get('/', async function(req, res) {
    // if session exists, redirect to main page, 
    // else request login
    const result = await session_user(req.sessionID);
    if (result === "error") {
        res.send('Server error...');
    } else if (result) {
        console.log('[LOG] already logged in');
        res.redirect('/')
    } else {
        res.sendFile('login.html', { root: path.join(__dirname, '../public/html/') });
    }
});

// OAuth (google)
routes.get('/oauth/googleAuth', oauth_initialization);
routes.get('/oauth/google', process_oauth_response);

module.exports = routes;