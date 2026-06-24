const express = require("express");

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

/**
 * Task routes — maps HTTP method + path to the controller that handles it.
 *
 * This router is mounted at "/api/tasks" in app.js, so the paths here are
 * relative to that prefix:
 *
 *   POST   /api/tasks       -> create a task
 *   GET    /api/tasks       -> list tasks
 *   GET    /api/tasks/:id   -> get one task
 *   PUT    /api/tasks/:id   -> update a task (full or partial)
 *   PATCH  /api/tasks/:id   -> update a task (alias of PUT)
 *   DELETE /api/tasks/:id   -> delete a task
 */
const router = express.Router();

// Routes sharing the same path are grouped with .route() for readability.
router.route("/").get(getTasks).post(createTask);

router
  .route("/:id")
  .get(getTask)
  .put(updateTask)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;
