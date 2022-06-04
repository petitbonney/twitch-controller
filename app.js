const dotenv = require("dotenv");
const expand = require("dotenv-expand");
const http = require("http");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { StaticAuthProvider } = require("@twurple/auth");
const { ApiClient } = require("@twurple/api");

const OK = 200;
const BAD_REQUEST = 400;
const UNAUTHORIZE = 401;
const NOT_FOUND = 404;

expand.expand(dotenv.config());
const streamer = process.env.STREAMER;
const oauth_uri = process.env.OAUTH_URI;
const port = process.env.API_PORT;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const react_uri = process.env.REACT_URI;
const botName = process.env.BOT_NAME;
const botOAuthToken = process.env.BOT_OAUTH_TOKEN;
console.log("OAuth URI:", oauth_uri);

const app = express();
const server = http.createServer(app);
app.use(cors({ origin: "*" }), express.static("public"));

// -----------------------------------------------
// Socket server
// -----------------------------------------------

const socket = require("./src/socket.js");
const io = socket.start(server);

// -----------------------------------------------
// Twitch API
// -----------------------------------------------

let twitch;

// -----------------------------------------------
// Chatbot
// -----------------------------------------------

const botAuthProvider = new StaticAuthProvider(botName, botOAuthToken);
const chatbot = require("./src/chatbot.js");
(async () => await chatbot.start(botAuthProvider, twitch, io, [streamer]))();

// -----------------------------------------------
// Endpoints
// -----------------------------------------------

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
      res.json(response.data);
      console.log(response.data);
    })
    .catch((err) => {
      res.send(err);
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
      console.log(response.status);
      console.log(response.data);
    })
    .catch((err) => {
      res.send(err);
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
      console.log(response.status);
      console.log(response.data);
    })
    .catch((err) => {
      res.send(err);
      console.log(err.response.status);
    });
});

app.get("/chatbot", (req, res) => {
  const active = chatbot.isConnected();
  console.log("Chatbot:", { active });
  res.json({ active });
});

app.get("/chatbot/:active", async (req, res) => {
  const active = req.params.active;
  const channels = req.query.channels;
  if (active === "on") {
    if (!channels) {
      res.status(BAD_REQUEST).send("Missing arguments: channels.");
    } else if (chatbot && chatbot.isConnected()) {
      res.status(UNAUTHORIZE).send("Chatbot already started.");
    } else {
      await chatbot.start(botAuthProvider, twitch, io, channels.split(","));
      res.json({ connected: true, channels });
    }
  } else if (active === "off") {
    if (chatbot && chatbot.isConnected()) {
      await chatbot.stop();
    }
    res.json({ connected: false });
  } else {
    res.sendStatus(NOT_FOUND);
  }
});

server.listen(port, () => {
  console.log("Listening on " + port);
});
