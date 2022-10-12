#!/usr/bin/env node

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const express = require("express");
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require("body-parser");
const path = require('path');

const imgModel = require('./Models/image')

const loginRouter = require('./Routes/login')
const logoutRouter = require('./Routes/logout')
const imageRouter = require('./Routes/image')
const userRouter = require('./Routes/user')

const app = express();


mongoose.connect(
        process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('mongodb connected:', process.env.MONGO_DBNAME))
    .catch(err => console.log(err));


// listen for error events on the connection. 
mongoose.connection.on('error', err => {
    console.log(err);
});

const session_store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    // remove unused session store immediately
    autoRemove: 'interval',
    autoRemoveInterval: 0,
    collection: 'session'
});

// Catch errors in session_db (MongoDB)
session_store.on('error', function(error) {
    console.log(error);
});


// middleware
// https://www.tutorialspoint.com/expressjs/expressjs_middleware.htm
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// path to static files
app.use(express.static(path.join(__dirname, "public")));


// Set EJS as templating engine
app.set("view engine", "ejs");

// cookie.secure: be careful when setting this to true, as compliant clients will not send the cookie back to the server in the future if the browser does not have an HTTPS connection.

// enable sessions and cookies
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    name: 'user', // optional
    saveUninitialized: false, // don't save unmodified session
    resave: true,
    cookie: { secure: false, httpOnly: false, maxAge: 24 * 60 * 60 * 1000 },
    store: session_store,
    unset: 'destroy'
}));

// Express Routes
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/image', imageRouter);
app.use('/user', userRouter);


// hello page (for testing)
app.get("/hello", (req, res) => {
    res.send("hi")
    console.log("Hello world");
});

// Home Page
app.get("/", async(req, res) => {
    try {
        // load images listed in image id (Mongodb),
        const result = await imgModel.find({}, {
            _id: true,
            metadata: true
        }).limit(20); // show at most 20 images

        // send result to client
        // res.json({
        //     'result': result
        // });
        var username = req.session.username;
        var loginBtn = (!req.session.loggedin) ? "block" : "none";
        var logoutBtn = (req.session.loggedin) ? "block" : "none";

        // console.log(result.slice(0, 20));
        res.render("mainPage", { images: result, loginBtn: loginBtn, logoutBtn: logoutBtn, username: username });

    } catch (err) {
        console.log(err);
        res.status(500).send("A server error occurred");
    }
});

const port = process.env.PORT;
app.listen(port, (err) => {
    if (err) throw err;
    console.log("Server listening on port", port);
});