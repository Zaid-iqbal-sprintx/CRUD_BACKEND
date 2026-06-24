require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

/**
 * Start the app:
 *   1. Connect to MongoDB first (we don't serve requests without a database).
 *   2. Then start listening for HTTP requests.
 */
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
