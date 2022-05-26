module.exports = ({ message, io }) => io.to("speech-synthesis").emit("speech", message);
