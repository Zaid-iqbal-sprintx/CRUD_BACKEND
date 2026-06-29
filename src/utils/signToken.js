const jwt = require("jsonwebtoken");

const AppError = require("./AppError");

/**
 * signToken — issue a JWT for a given user id.
 *
 * The token's only claim is the user id (`sub`-style `id`); the protect
 * middleware reads it back to look the user up. JWT_SECRET must be set in the
 * environment — without it we can't sign safely, so we fail loudly with a 500
 * rather than minting tokens nobody can trust.
 */
function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("Server misconfigured: JWT_SECRET is not set", 500);
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

module.exports = signToken;
