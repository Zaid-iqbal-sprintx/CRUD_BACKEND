const mongoose = require("mongoose");

const AppError = require("../utils/AppError");

/**
 * validateObjectId — middleware that rejects a malformed `:id` early.
 *
 * Without this, a bad id like "/api/tasks/abc" travels all the way to Mongoose,
 * which throws a CastError. This stops it at the door with a clear 400 before
 * we ever touch the database — cheaper, and a better message.
 *
 * Middleware runs before the controller; calling next() passes control on,
 * calling next(err) jumps straight to the central error handler.
 */
function validateObjectId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError(`Invalid task id: ${req.params.id}`, 400));
  }
  next();
}

module.exports = validateObjectId;
