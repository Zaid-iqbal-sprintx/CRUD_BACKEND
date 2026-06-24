const express = require("express");

/**
 * Build and configure the Express application.
 *
 * Kept separate from server.js so the "app" (routes + middleware) is decoupled
 * from "starting the server" (listening on a port). Routes for tasks will be
 * mounted here in a later PR.
 */
const app = express();

// Parse incoming JSON request bodies into req.body
app.use(express.json());

// Health check — a simple way to confirm the server is up and responding.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

// 404 handler — any route we did not define lands here.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler — keeps error responses consistent across the app.
// Express recognises this as an error handler because it takes 4 arguments.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;
