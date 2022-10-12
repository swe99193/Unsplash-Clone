/** this module contains all OAuth APIs.
 * e.g., upload, search, likes. 
 */

const { google } = require('googleapis');
const fs = require('fs');
const userModel = require('../Models/user')


const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

/**
 * initialize an google OAuth2 client
 * @returns {google.auth.OAuth2} An initialized OAuth2 client
 */
function init_oAuth2Client() {
    // load credentials
    const content = fs.readFileSync('client_secret.json');
    const credentials = JSON.parse(content);
    const { client_id, client_secret, redirect_uri } = credentials

    // Create an OAuth2 client with the credentials
    return oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
};


/**
 * get user email address w/ google OAuth2
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function getUserEmail(auth) {
    const service = google.people({ version: 'v1', auth });

    const profile = await service.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses',
    });

    return profile.data.emailAddresses[0].value;
}


/**
 * callback for google oauth
 * initialize OAuth2 and request auth from the user
 */
const oauth_initialization = (req, res) => {
    const oAuth2Client = init_oAuth2Client();

    const oauth_Url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    // redirect to OAuth consent screen
    res.redirect(oauth_Url);
};

/**
 * callback for google oauth
 * receive auth code from the server
 */
const process_oauth_response = async(req, res) => {
    const oAuth2Client = init_oAuth2Client();

    // handler for authorization failure
    var err = req.query.error
    if (err) {
        console.log('Error: ' + err);

        if (err === "access_denied") {
            res.status(401).send('Access not granted');
        } else {
            res.status(500).send('A server error occurred.');
        }
    }

    const code = req.query.code

    // with code, get token
    try {
        var { tokens } = await oAuth2Client.getToken(code);
    } catch (err) {
        // console.log('[LOG] code reused');
        res.status(401).send('please authorize again');
        return
    }

    oAuth2Client.setCredentials(tokens);

    // obtain user email
    try {
        var email_addr = await getUserEmail(oAuth2Client);
    } catch (err) {
        console.log(err);
        res.status(500).send("A server error occurred");
        return
    }
    console.log('user email: ' + email_addr);

    // make a user profile if a new user visit
    const result = await userModel.findOne({ username: email_addr });

    console.log(result);
    if (!result)
        await userModel.create({ username: email_addr, name: 'new_user', oauth: 'google' });

    // determine redirect page

    // TODO: OAuth complete, redirect to main page
    if (result) {
        console.log("[LOG] old user login");
        req.session.loggedin = true;
        req.session.username = email_addr;
        res.redirect('/');
    }
    // TODO: if user account not exists, prompt the user to configure name
    else {
        console.log("[LOG] NEW user login");
        req.session.loggedin = true;
        req.session.username = email_addr;
        res.redirect('/user/account');
    }
};




module.exports = {
    oauth_initialization,
    process_oauth_response
};