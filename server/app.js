'use strict';

const PORT = process.env.PORT;
const express = require('express');
const app = express();
const landing = require('./landing');
const ParseServer = require('parse-server').ParseServer;
const Dashboard = require('parse-dashboard');

const appsCount = PORT == 3000 ? 2 : 1;

const apps = [];
let local, remote;

if (appsCount == 2) {
  local = {
    "serverURL": process.env.JARA_SERVER_URL,
    "appId": process.env.JARA_APP_ID,
    "masterKey": process.env.JARA_MASTER_KEY,
    "appName": process.env.JARA + " Local."
  }
  apps.push(local);

  remote = {
    "serverURL": "https://shrouded-badlands-71318.herokuapp.com/v1",
    "appId": process.env.JARA_APP_ID,
    "masterKey": process.env.JARA_MASTER_KEY,
    "appName": process.env.JARA + " Remote."
  }

  apps.push(remote);
} else {
  remote = {
    "serverURL": process.env.JARA_SERVER_URL,
    "appId": process.env.JARA_APP_ID,
    "masterKey": process.env.JARA_MASTER_KEY,
    "appName": process.env.JARA
  }
  apps.push(remote);
}

app.set('port', PORT);

const api = new ParseServer({
  databaseURI: process.env.JARA_DATABASE_URI,
  cloud: __dirname + '/cloud/main.js',
  appId: process.env.JARA_APP_ID,
  masterKey: process.env.JARA_MASTER_KEY,
  serverURL: process.env.JARA_SERVER_URL || 'http://localhost:3000/v1', // Don't forget to change to https if needed
  publicServerURL: process.env.JARA_PUB_SERVER_URL,
  push: {
    android: {
      senderId: process.env.JARA,
      apiKey: 'AIzaSyBxv2pRo-npP3hE2GxpQfEOd7U6BrJoEDY'
    }
  },
  liveQuery: {
    classNames: ["Deal"] // List of classes to support for query subscriptions
  }
});

const options = { allowInsecureHTTP: false };

const dashboard = new Dashboard({
  "apps": apps,
  "users": [
    {
      "user": "mrsmith9ja",
      "pass": "P@b0p0v!b"
    }
  ]
}, options);

const mountPath = `/${process.env.JARA_PARSE_MOUNT}`;

app.use(mountPath, api);
app.use('/dashboard', dashboard);
app.use('/', landing);

module.exports = app