const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const signToken = require("../utils/signToken");

/**
 * Auth controllers — register, login, and "who am I".
 *
 * Both register and login respond with the same envelope as the rest of the
 * API, plus a `token` the client stores and sends back as
 * `Authorization: Bearer <token>` on protected requests.
 */

// Shape a user document for the response. NEVER include the password hash —
// even though it's `select: false`, this is an explicit allow-list so a future
// field can't leak by accident.
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

/**
 * POST /api/auth/register
 * Create an account and return a token so the user is logged in immediately.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Create through the model so the schema validation + password-hash hook run.
  // A duplicate email trips the unique index and surfaces as a 409 in app.js.
  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    message: "Account created",
    token: signToken(user._id),
    data: publicUser(user),
  });
});

/**
 * POST /api/auth/login
 * Verify credentials and return a token.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Password is select:false, so ask for it explicitly to compare.
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  // Same message whether the email is unknown or the password is wrong — don't
  // reveal which accounts exist.
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  res.status(200).json({
    success: true,
    message: "Logged in",
    token: signToken(user._id),
    data: publicUser(user),
  });
});

/**
 * GET /api/auth/me
 * Return the currently authenticated user. `protect` has already attached it.
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: publicUser(req.user),
  });
});

module.exports = { register, login, getMe };
