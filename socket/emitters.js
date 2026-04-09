const { getIO } = require("./index");

const sendCartUpdate = (userId) => {
  const io = getIO();
  if (!io) return;
  io?.to(`${userId}`).emit("cart:updated");
};

const sendFavUpdate = (userId) => {
  const io = getIO();
  if (!io) return;
  io?.to(`${userId}`).emit("favorite:updated");
};

module.exports = {
  sendCartUpdate,
  sendFavUpdate,
};
