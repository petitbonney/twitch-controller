/**
 * Twitch message received emit on "chat"
 * To say something in chat, emit on "say"
 * To play a sound, emit on "sound"
 * To speech synthesis, emit on "speech"
 */

(async () => {
  const { StaticAuthProvider } = require("@twurple/auth");
  const { ChatClient } = require("@twurple/chat");
  const { Server } = require("socket.io");
  const http = require("http");
  const express = require("express");
  const cors = require("cors");
  const dotenv = require("dotenv");
  const expand = require("dotenv-expand");

  expand.expand(dotenv.config());

  const streamer = process.env.STREAMER;
  const port = process.env.API_PORT;
  const botName = process.env.BOT_NAME;
  const botOAuthToken = process.env.BOT_OAUTH_TOKEN;

  const app = express();
  const server = http.createServer(app);
  app.use(cors({ origin: "*" }), express.static("public"));

  const io = new Server(server, { cors: { origin: "*" } });

  const authProvider = new StaticAuthProvider(botName, botOAuthToken);
  const chatClient = new ChatClient({ authProvider, channels: [streamer] });
  await chatClient.connect();

  chatClient.onMessage(async (channel, user, message, msg) => {
    console.log(user, message);
    io.emit("chat", channel, user, message, msg);
  });

  io.on("connection", (socket) => {
    console.log(socket.id, "connected");

    socket.on("say", (message) => {
      console.log(socket.id, "Chat message:", message);
      chatClient.say(streamer, message);
    });

    socket.onAny((event, ...args) => {
      console.log(socket.id, event, ":", args);
      io.emit(event, args);
    });
  });

  server.listen(port, () => {
    console.log("Listening on " + port);
  });
})();
