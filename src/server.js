import express from "express";
import { matchesRouter } from "./routes/matches.routes.js";

const app = express();
const PORT = 8000;

// JSON middleware
app.use(express.json());
// app.use();

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Sport Scoreboard API",
    url: `http://localhost:${PORT}`,
  });
});

app.use("/matches", matchesRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});
