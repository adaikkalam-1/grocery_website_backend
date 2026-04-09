const { Server } = require("socket.io");
const socketAuth = require("./middleware");

let io;

const initSocket = (server, corsOptions) => {
  io = new Server(server, {
    cors: corsOptions,
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    socket.join(`${socket.userId}`);
    console.log("User connected");
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
    socket.on("error", (err) => {
      console.log(err);
    });
  });
};

const getIO = () => io;

module.exports = {
  initSocket,
  getIO,
};
