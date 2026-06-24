/**
 * AppError — an Error that also carries an HTTP status code.
 *
 * A plain `throw new Error("...")` has no status, so the central error handler
 * can only guess (and defaults to 500). With AppError we can say exactly what
 * went wrong AND what status the client should get:
 *
 *   throw new AppError(`No task found with id ${id}`, 404);
 *
 * `isOperational` marks errors we threw on purpose (expected, client-facing)
 * versus unexpected bugs — handy for deciding what to log.
 */
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.isOperational = true;

    // Keep this constructor out of the stack trace for cleaner logs.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
