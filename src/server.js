import express from "express";
import { matchesRouter } from "./routes/matches.routes.js";
import http from "http";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";
import { commentaryRouter } from "./routes/commentary.js";

const app = express();
const PORT = Number(process.env.PORT ?? 8000);
const HOST = process.env.HOST ?? "0.0.0.0";

const httpServer = http.createServer(app);

// JSON middleware
app.use(express.json());
app.use(securityMiddleware());

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Sport Scoreboard API",
    url: `http://localhost:${PORT}`,
  });
});

app.use("/matches", matchesRouter);
app.use("/matches/:id/commentary", commentaryRouter);

const { broadcastMatchCreated } = attachWebSocketServer(httpServer);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// Start server
httpServer.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

  console.log(`Server is running on ${baseUrl}`);
  console.log(
    `WebSocket server is running on ${baseUrl.replace("http", "ws")}/ws`,
  );
});
