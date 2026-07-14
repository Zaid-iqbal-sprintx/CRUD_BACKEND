const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User schema — an account that can log in and call the protected task API.
 *
 * The password is NEVER stored in plain text. A pre-save hook hashes it with
 * bcrypt, and `select: false` keeps the hash out of normal query results so we
 * don't accidentally leak it in a response. Use `.select("+password")` when you
 * explicitly need it (login).
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name"],
      trim: true,
      maxlength: [80, "Name cannot be longer than 80 characters"],
    },

    email: {
      type: String,
      required: [true, "A user must have an email"],
      unique: true, // a duplicate signup surfaces as a 409 (see app.js)
      lowercase: true, // store canonicalised so logins are case-insensitive
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "A user must have a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // excluded from queries unless explicitly requested
    },
  },
  { timestamps: true }
);

// Hash the password before saving — but only when it actually changed, so
// updates that don't touch the password don't re-hash an already-hashed value.
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare a plaintext candidate against the stored hash. Returns a boolean.
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
