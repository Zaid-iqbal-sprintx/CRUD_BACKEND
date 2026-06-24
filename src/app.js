const express = require("express");

const taskRoutes = require("./routes/taskRoutes");

/**
 * Build and configure the Express application.
 *
 * Kept separate from server.js so the "app" (routes + middleware) is decoupled
 * from "starting the server" (listening on a port).
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

// Task CRUD routes, all under /api/tasks
app.use("/api/tasks", taskRoutes);

// 404 handler — any route we did not define lands here.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler — keeps error responses consistent across the app.
// Express recognises this as an error handler because it takes 4 arguments.
//
// It also translates the Mongoose errors our controllers can throw into the
// right HTTP status code, so callers get a 400 for bad input instead of a
// blanket 500.
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Internal server error";

  // Bad ObjectId in the URL, e.g. GET /api/tasks/not-a-real-id
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Schema validation failed (missing title, bad enum value, etc.).
  // Collect every field's message into one readable string.
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Only log unexpected (server-side) errors; client mistakes are noise.
  if (status >= 500) console.error(err.stack);

  res.status(status).json({
    success: false,
    message,
  });
});

module.exports = app;
