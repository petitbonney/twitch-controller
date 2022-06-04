const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");

const credentials = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
};

const app = express();
const server = https.createServer(credentials, app);

app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.sendStatus(200);
});

exports.start = (port = 443) => {
  server.listen(port, () => {
    console.log("Listening on " + port);
  });
};
