const express = require("express");

const { register, login, getMe } = require("../controllers/authController");
const protect = require("../middleware/protect");

/**
 * Auth routes — mounted at "/api/auth" in app.js:
 *
 *   POST /api/auth/register  -> create an account, returns a token
 *   POST /api/auth/login     -> exchange credentials for a token
 *   GET  /api/auth/me        -> the current user (requires a valid token)
 */
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;
