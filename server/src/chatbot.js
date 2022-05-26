const { ChatClient } = require("@twurple/chat");
const commands = require("../commands");

let chatClient;

exports.start = (authProvider, apiClient, io, channels) => {
  chatClient = new ChatClient({ authProvider, channels });

  console.log("Connecting to", channels);
  chatClient.connect();

  chatClient.onMessage(async (channel, user, message, msg) => {
    const context = { apiClient, io, chatClient, channel, user, message, msg };

    const isHighlight = msg._tags.get("msg-id") === "highlighted-message";
    const isRedemption = msg._tags.get("msg-id") === "custom-reward-id";
    const isCheer = msg._tags.get("msg-id") === "bits";
    
    console.log(`[${channel}]`, user, ":", message);

    if (isHighlight) {
      commands["speech-synthesis"](context);
    }

    if (message.startsWith("!")) {
      const args = message.slice(1).split(" ");
      const cmd = args.shift().toLowerCase();

      if (cmd in commands) {
        commands[cmd]({ ...context, cmd, args });
      }
    }
  });
};

exports.stop = () => {
  if (chatClient) {
    chatClient.quit();
  }
};

exports.isConnected = Boolean(chatClient && chatClient.isConnected);
