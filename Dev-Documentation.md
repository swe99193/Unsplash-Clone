# Documentation
## File structure
* **/Controllers**: APIs supporting Express routes
* **/Database**: MongoDB, Elasticsearch connection client
* **/Images**: image storage
* **/Models**: MongoDB database schema
* **/public**: html, css, javascript files for the UI.
* **/Routes**: Express routes (supported by Controller files)
* **/uploads**: buffer, receives uploaded files (multer)
* **/views**: The view rendered by the server to the client (e.g. Jade, EJS, ...)
* **app.js**: The entry point of the Express application (as minimal as possible)


## Database Design
### images.files; image metadata (MongoDB, GridFS)
* `_id`(ObjectId): id, created internally
* `name`: image title
* `desc`: image description
* `owner`: username (email)
* `tags`: some keywords for search engine to perform full-text search e.g., sunshine, dark;
* `likes`: # of likes


### user (MongoDB, with Oauth)
* `username`: username (email)
* `name`: username used in the app
* `oauth`: oauth provider (e.g., Google, Facebook, etc.)

### likes (MongoDB)
each row represents an image like
* `imgId`(string): image id
* `username`: username (email)

### image-tags (elasticsearch)
* `_id`: id, from MongoDB
* `tags`: mixed keywords delimited by whitespace (full-text search)

### session (MongoDB)
* `_id`: sessionID
* `expires`: expire time
* `session`: session info, containing username(email) and loggedin flag

## MongoDB setup (macOS as an example)
* using Homebrew to install and run MongoDB
* see details in [Documentation](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/#std-label-install)

#### run MongoDB as localhost
* start service:
```sh
brew services start mongodb-community@6.0
```
* stop service:
```sh
brew services stop mongodb-community@6.0
```

## Elasticsearch setup (Docker)
* run Elasticsearch on Docker image 
* see details in [Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)

Copy `http_ca.crt` security certificate in ES docker to the project root directory (required by Nodejs esclient)
```sh
docker cp <container_name>:/usr/share/elasticsearch/config/certs/http_ca.crt
```