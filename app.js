const express = require("express");
const cors = require("cors");
const app = express();
require("./config/dbConfig");

app.set("trust proxy", 1);

app.use(
  cors({
    origin: "https://grocery-website-sable.vercel.app",
    credentials: true,
  }),
);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port .... ${PORT}`);
});
