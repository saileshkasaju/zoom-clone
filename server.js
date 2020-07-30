const express = require("express");
const { ExpressPeerServer } = require("peer");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

const peerServer = ExpressPeerServer(server, {
  proxied: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`server running of port ${PORT}`);
});
