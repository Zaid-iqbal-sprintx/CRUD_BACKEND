const jwt = require("jsonwebtoken");

const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * protect — gate a route behind a valid JWT.
 *
 * Expects an `Authorization: Bearer <token>` header. It verifies the token,
 * loads the user it points at, and attaches them as `req.user` for downstream
 * handlers. Any problem (no token, bad/expired token, deleted user) is a 401.
 *
 * Mount it before a route (or a whole router) to require authentication:
 *   app.use("/api/tasks", protect, taskRoutes);
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new AppError("Not authorized — no token provided", 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // Covers both a tampered token (JsonWebTokenError) and an expired one.
    throw new AppError("Not authorized — invalid or expired token", 401);
  }

  // The token could outlive the account (e.g. the user was deleted).
  const user = await User.findById(payload.id);
  if (!user) {
    throw new AppError("The user for this token no longer exists", 401);
  }

  req.user = user;
  next();
});

module.exports = protect;
