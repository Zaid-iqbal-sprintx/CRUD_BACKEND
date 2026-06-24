/**
 * asyncHandler — wraps an async route handler so we don't have to write
 * try/catch in every controller.
 *
 * Express 4 does NOT automatically catch errors thrown inside an async
 * function. If a Promise rejects and nobody catches it, the request just
 * hangs. This helper runs the handler and forwards any rejection to
 * `next(err)`, which hands control to the central error handler in app.js.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 */
function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
