const { Server } = require("socket.io");

let io;

exports.start = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log(socket.id, "connected");
    socket.on("room", (room) => {
      console.log(socket.id, "joining room", room);
      socket.join(room.split(","));
    });
  });

  return io;
};

exports.stop = () => {
  server.close(() => {
    console.log("Closing socket server...");
  });
  io.disconnectSockets();
};
