const mongoose = require("mongoose");

/**
 * Task schema — the shape of a single task document in MongoDB.
 *
 * A schema is where we declare:
 *   - which fields a task has,
 *   - their types,
 *   - and the validation rules the database layer enforces for us
 *     (so a bad payload is rejected before it ever reaches the collection).
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A task must have a title"],
      trim: true, // strip leading/trailing whitespace
      minlength: [1, "Title cannot be empty"],
      maxlength: [120, "Title cannot be longer than 120 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot be longer than 2000 characters"],
      default: "",
    },

    // A small, fixed set of allowed values. Anything else is rejected.
    // These mirror the frontend's Status options (To Do / In Progress / Done).
    status: {
      type: String,
      enum: {
        values: ["todo", "in-progress", "done"],
        message: "Status must be one of: todo, in-progress, done",
      },
      default: "todo",
    },

    // Mirrors the frontend's priority options (Low / Medium / High / Urgent).
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message: "Priority must be one of: low, medium, high, urgent",
      },
      default: "medium",
    },

    // Optional deadline. Used later to flag a task as "overdue".
    due: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically manage createdAt / updatedAt timestamps.
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
