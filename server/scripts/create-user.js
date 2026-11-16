/**
 * Create (or reset the password of) a classroom user directly in MongoDB.
 * For local development: a fresh database has no admin, so nobody can use
 * the Register page or /user/register to create the first account.
 *
 * Uses MONGO_URI from server/.env (default mongodb://localhost:27017/c2stem-class).
 *
 * Usage (from c2stem-server/server):
 *   node scripts/create-user.js <username> <password> [--role Admin] [--class SPICE]
 *        [--email you@example.com] [--group All] [--teacher None]
 *
 * Note: classroom login also signs in to the SPICE editor with the same
 * username and password, so use an account that exists on
 * spiceeditor.c2-stem.org.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/user");

const args = process.argv.slice(2);
const [username, password] = args.filter((a, i) => !a.startsWith("--") && !(args[i - 1] || "").startsWith("--"));
const option = (name, fallback) => {
  const i = args.indexOf("--" + name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

if (!username || !password) {
  console.error(
    "usage: node scripts/create-user.js <username> <password> [--role Admin] [--class SPICE] [--email x] [--group All] [--teacher None]"
  );
  process.exit(1);
}

const mongoUri =
  process.env.MONGO_URI || "mongodb://localhost:27017/c2stem-class";

async function main() {
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  let user = await User.findOne({ username });
  const created = !user;
  if (!user) user = new User({ username });
  user.email = option("email", user.email || `${username}@localhost`);
  user.role = option("role", created ? "Admin" : user.role);
  user.class = option("class", user.class || "SPICE");
  user.group = option("group", user.group || "All");
  user.teacher = option("teacher", user.teacher || "None");
  user.setPassword(password);
  await user.save();
  console.log(
    `${created ? "Created" : "Updated"} user "${username}" ` +
      `(role ${user.role}, class ${user.class}) in ${mongoUri.replace(/\/\/[^@]*@/, "//***@")}`
  );
}

main()
  .catch((err) => {
    console.error("Failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
