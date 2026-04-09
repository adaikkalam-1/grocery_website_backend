const { getIO } = require("./index");

const sendCartUpdate = (userId) => {
  const io = getIO();
  if (!io) return;
  io?.to(`${userId}`).emit("cart:updated");
};

module.exports = {
  sendCartUpdate,
};
