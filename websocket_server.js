const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/scoreboard", express.static(path.join(__dirname, "overlays", "scoreboard")));
app.use("/matchup", express.static(path.join(__dirname, "overlays", "matchup_lower_third")));
app.use("/lineup_home", express.static(path.join(__dirname, "overlays", "lineup_formation_home")));
app.use("/refs", express.static(path.join(__dirname, "overlays", "ref_lineup")));
app.use("/matchup_stacked", express.static(path.join(__dirname, "overlays", "matchup_stacked")));
app.use("/lineup_away", express.static(path.join(__dirname, "overlays", "lineup_away")));
app.use("/", express.static(__dirname));

const PORT = 3000;

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on("connection", (ws) => {
  console.log("✅ WebSocket client connected");

  ws.on("message", (msg) => {
    console.log("📨 Received:", msg);
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.error("❌ Failed to parse message:", msg);
      return;
    }
    broadcast(data);
  });

  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`💻 WebSocket server is running on ws://localhost:${PORT}`);
});