const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

/**
 * Task controllers — one function per REST action.
 *
 * Each function:
 *   - reads what it needs from `req` (params, body, query),
 *   - talks to the Task model,
 *   - and replies with our standard JSON envelope:
 *       { success, message?, data }
 *   - using the correct HTTP status code.
 *
 * Errors (validation failures, bad ids, etc.) are thrown and bubble up to
 * the central error handler in app.js via asyncHandler.
 */

// Only these fields may be set from a request body. Anything else the client
// sends (e.g. _id, createdAt) is ignored, so callers can't overwrite internals.
const ALLOWED_FIELDS = ["title", "description", "status", "priority", "due"];

function pickAllowed(body = {}) {
  const out = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

/**
 * POST /api/tasks
 * Create a new task.
 */
const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create(pickAllowed(req.body));

  res.status(201).json({
    success: true,
    message: "Task created",
    data: task,
  });
});

/**
 * GET /api/tasks
 * List all tasks. Supports optional ?status= and ?priority= filters.
 */
const getTasks = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;

  // Newest first.
  const tasks = await Task.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

/**
 * GET /api/tasks/:id
 * Fetch a single task by id.
 */
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new AppError(`No task found with id ${req.params.id}`, 404);
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

/**
 * PUT /api/tasks/:id
 * Update an existing task.
 *
 * - `new: true` returns the document AFTER the update (not the old one).
 * - `runValidators: true` re-applies the schema rules on update, so an
 *   update can't slip past the same validation a create has to pass.
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    pickAllowed(req.body),
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new AppError(`No task found with id ${req.params.id}`, 404);
  }

  res.status(200).json({
    success: true,
    message: "Task updated",
    data: task,
  });
});

/**
 * DELETE /api/tasks/:id
 * Remove a task.
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    throw new AppError(`No task found with id ${req.params.id}`, 404);
  }

  res.status(200).json({
    success: true,
    message: "Task deleted",
    data: task,
  });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};
