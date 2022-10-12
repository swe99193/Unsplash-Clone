const express = require('express');
const routes = express.Router();

// Logout & delete session
routes.get('/', async function(req, res) {
    // delete session (set null)
    req.session = null;
    console.log('[log] log out');
    res.redirect('/')
});


module.exports = routes;