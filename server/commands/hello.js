module.exports = ({ chatClient, channel, user }) => {
  chatClient.say(channel, `@${user}, heya!`);
};
