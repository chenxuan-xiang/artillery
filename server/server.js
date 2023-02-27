const {GameMaster} = require('./GameMaster');
const express = require('express');
const http = require('http');
const path = require("path");
const app = express();
const server = http.createServer(app);
const gameMaster = new GameMaster(server);
const port = process.env.PORT || 3001;

const buildPath = path.resolve(__dirname, '..')
console.log(buildPath)
app.use(express.static(path.join(buildPath, "build")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(buildPath, "build", "index.html"));
});

server.listen(port, () => {
  console.log('Server running on port 3001');
});

