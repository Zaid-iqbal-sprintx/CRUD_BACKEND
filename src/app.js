const express = require("express");
const cors = require("cors");

const taskRoutes = require("./routes/taskRoutes");

/**
 * Build and configure the Express application.
 *
 * Kept separate from server.js so the "app" (routes + middleware) is decoupled
 * from "starting the server" (listening on a port).
 */
const app = express();

// Enable CORS so a browser frontend on a different origin (e.g. localhost:3000)
// can call this API. By default all origins are allowed; set CORS_ORIGIN in
// .env (e.g. "http://localhost:3000") to lock it down to a single origin.
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

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
// It translates the errors our app can throw (AppError, Mongoose errors, bad
// JSON) into the right HTTP status code and a consistent body, so callers get
// a meaningful 400/404/409 instead of a blanket 500.
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Internal server error";
  let errors; // optional per-field detail for validation failures

  // Malformed JSON in the request body (express.json() throws a SyntaxError).
  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON in request body";
  }

  // Bad ObjectId reaching Mongoose, e.g. GET /api/tasks/not-a-real-id.
  // (validateObjectId catches most of these earlier; this is the safety net.)
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Schema validation failed (missing title, bad enum value, etc.).
  // Return one message per offending field so a client can map errors to inputs.
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Duplicate value on a unique field (no unique fields yet, but future-proof).
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for "${field}"`;
  }

  // Only log unexpected (server-side) errors; client mistakes are noise.
  if (status >= 500) console.error(err.stack);

  res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
    // Surface the stack only in development to aid debugging; never in prod.
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
