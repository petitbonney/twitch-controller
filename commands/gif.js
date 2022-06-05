module.exports = ({ io, chatClient, channel, user, args }) => {
  const tag = args[0];
  if (tag) {
    chatClient.say(channel, `@${user} a choisi le thème du gif suivant : ${tag}`);
    io.to("gif").emit("tag", tag);
  }
};
