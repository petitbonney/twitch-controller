const dotenv = require("dotenv");
const expand = require("dotenv-expand");
const http = require("http");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const socket = require("./src/socket.js");

expand.expand(dotenv.config());

const oauth_uri = process.env.OAUTH_URI;
const port = process.env.API_PORT;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const react_uri = process.env.REACT_URI;

console.log("OAuth URI:", oauth_uri);

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "*" }));

const io = socket.start(server);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.get("/connect", (req, res) => {
  res.redirect(oauth_uri);
});

app.get("/token", (req, res) => {
  const grant_type = "authorization_code";
  const code = req.query.code;
  console.log("Code:", code);
  axios({
    method: "POST",
    headers: { Accept: "application/json" },
    url: "https://id.twitch.tv/oauth2/token",
    params: { client_id, client_secret, code, redirect_uri, grant_type },
  })
    .then((response) => {
      const token = response.data.access_token;
      res.redirect(react_uri + "?token=" + token);
      console.log(response.data);
    })
    .catch((err) => {
      res.redirect(react_uri);
      console.log(err.response.status);
    });
});

app.get("/verify", (req, res) => {
  const token = req.query.token;
  console.log("Verify:", token);
  axios({
    method: "GET",
    headers: { Authorization: "OAuth " + token },
    url: "https://id.twitch.tv/oauth2/validate",
  })
    .then((response) => {
      res.json(response.data);
      console.log(response.data);
    })
    .catch((err) => {
      res.sendStatus(err.response.status);
      console.log(err.response.status);
    });
});

app.get("/disconnect", (req, res) => {
  const token = req.query.token;
  console.log("Revoke:", token);
  axios({
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    url: "https://id.twitch.tv/oauth2/revoke",
    params: { client_id, token },
  })
    .then((response) => {
      res.json(response.data);
      console.log(response.data);
    })
    .catch((err) => {
      res.sendStatus(err.response.status);
      console.log(err.response.status);
    });
});

server.listen(port, () => {
  console.log("Listening on " + port);
});
