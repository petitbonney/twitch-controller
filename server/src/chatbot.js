const { StaticAuthProvider } = require("@twurple/auth");
const { ChatClient } = require("@twurple/chat");
const dotenv = require("dotenv");
const expand = require("dotenv-expand").expand;

let chatClient;

exports.start = (io, ...channels) => {
  expand(dotenv.config());

  const authProvider = new StaticAuthProvider(
    process.env.BOT_NAME,
    process.env.BOT_OAUTH_TOKEN
  );

  chatClient = new ChatClient({ authProvider, channels });

  console.log("Connecting to", channels);
  chatClient.connect();

  chatClient.onMessage(async (channel, user, message, msg) => {
    console.log(channel, user, ":", message);
    if (!message.startsWith("!")) return;

    // Extract arguments
    const args = message.slice(1).split(" ");
    const cmd = args.shift().toLowerCase();

    if (cmd === "speech") {
      io.to("speech-synthesis").emit(
        "speech",
        args.join(" ").substring(0, 280)
      );
    }
  });
};

exports.stop = () => {
  if (chatClient) {
    chatClient.quit();
  }
};

const { Server } = require("socket.io");

const io = new Server(4040, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log(socket.id + " connected.");
  socket.on("room", (room) => {
    console.log(socket.id + " joining room " + room);
    socket.join(room);
  });
});

this.start(io, "petitbonney");
