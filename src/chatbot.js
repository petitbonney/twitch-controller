const { ChatClient } = require("@twurple/chat");
const commands = require("../commands");
const instants = require("./my-instants.js");

const playSound = (io, sound) => io.to("play-sound").emit("play", sound);
const speechSynthesis = (io, message) => io.to("speech-synthesis").emit("speech", message);

let chatClient;

exports.start = async (authProvider, apiClient, io, channels) => {
  chatClient = new ChatClient({ authProvider, channels });

  console.log("Connecting to", channels);
  await chatClient.connect();

  // -----------------------------------------------
  // Messages
  // -----------------------------------------------
  chatClient.onMessage(async (channel, user, message, msg) => {
    isHighlight = msg._tags.get("msg-id") === "highlighted-message";

    // Normal messages
    console.log(`[${channel}]`, user, ":", message);

    // Highlighted messages
    if (isHighlight) {
      speechSynthesis(io, message);
    }

    // Reward redemption messages
    if (msg.isRedemption) {
      if (msg.tags.get("custom-reward-id") === "3aef65a4-b349-4ddb-bf1d-7bb2ce63c9ab") {
        const sound = await instants.getInstant(message, true);
        console.log("sound", sound)
        playSound(io, sound);
      }
    }

    // Cheer messages
    if (msg.isCheer) {
      speechSynthesis(io, message);
    }

    // Messages starting with "!"
    if (message.startsWith("!")) {
      const args = message.slice(1).split(" ");
      const cmd = args.shift().toLowerCase();

      if (cmd in commands) {
        commands[cmd]({ apiClient, io, chatClient, channel, user, message, msg, cmd, args });
      }
    }
  });

  // -----------------------------------------------
  // Subscriptions
  // -----------------------------------------------
  chatClient.onSub((channel, user, subInfo, msg) => {});

  // -----------------------------------------------
  // Resubscriptions
  // -----------------------------------------------
  chatClient.onResub((channel, user, subInfo, msg) => {});
};

exports.stop = async () => {
  if (chatClient) {
    await chatClient.quit();
  }
};

exports.isConnected = () => Boolean(chatClient && chatClient.isConnected);
