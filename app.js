const express = require("express");
const cors = require("cors");
const app = express();
require("./config/dbConfig");
const http = require("http");
const { initSocket } = require("./socket/index");

// app.set("trust proxy", 1);

const corsOptions = {
  origin: [
    "https://grocery-website-sable.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  express.json({
    limit: "50mb",
    extended: true,
  }),
);
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  }),
);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api", require("./src/routes/index"));
const server = http.createServer(app);
initSocket(server, corsOptions);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port .... ${PORT}`);
});
