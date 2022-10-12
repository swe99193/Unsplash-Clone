# Unsplash Clone
## Project Description
A photography and wallpaper sharing platform.

#### search photos
![search photos](/imgs/1.png)
#### like photos
![like photos](/imgs/2.png)
#### OAuth login
![OAuth login](/imgs/3.png)
#### upload photos
![upload photos](/imgs/4.png)

## Technologies & Tools
1. Application: Node.js, Express
2. Database: MongoDB, Elasticsearch
3. Third-party APIs: Google OAuth2.0
4. UI: HTML, CSS, Javascript, jQuery, Bootstrap


## Quick Start
#### Install node modules, and start server
```
npm install
npm start
```

#### Required Configuration:
* Environment parameters: `.env`
* Google Oauth credentials: `client_secret.json`
* Elasticsearch client CA: `http_ca.crt`

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