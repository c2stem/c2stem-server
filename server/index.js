require("dotenv").config();
require("./config/passport");
const express = require("express");
const server = express();
const path = require("path");
const cors = require("cors");
const passport = require("passport");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const UserRoute = require("./routes/userRoute");
const StateRoute = require("./routes/stateRoute");
const ActionRoute = require("./routes/actionRoute");

port = process.env.PORT || 8203;
// e.g. mongodb://c2stem:<password>@10.0.0.5:27017/c2stem-class?authSource=admin
mongo_uri = process.env.MONGO_URI || "mongodb://localhost:27017/c2stem-class";

mongoose
  .connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: +process.env.MONGO_POOL_SIZE || 20,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN!");
  })
  .catch((err) => {
    console.log("MONGO CONNECTION ERROR!!");
    console.log(err);
  });

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error"));
// db.once("open", () => {
//     console.log("Database connected");
// });

server.set("view engine", "html");
server.use(express.static(path.join(__dirname, "../client/dist")));
// state/setState carries design history, which can exceed the 100kb default
server.use(bodyParser.json({ limit: process.env.JSON_LIMIT || "5mb" }));
server.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
// server.use(cors());
server.use(passport.initialize());

// comma-separated list, e.g. CORS_ORIGINS=https://spice.c2-stem.org,http://localhost:8080
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:8080")
  .split(",")
  .map((o) => o.trim());
// Local development: also accept http://localhost:<any port> and
// http://127.0.0.1:<any port>. On by default when CORS_ORIGINS is not set
// (i.e. a local server); a deployed server must opt in with
// CORS_ALLOW_LOCALHOST=true.
const allowLocalhost =
  process.env.CORS_ALLOW_LOCALHOST === "true" || !process.env.CORS_ORIGINS;
const LOCALHOST_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;
  return allowLocalhost && LOCALHOST_ORIGIN.test(origin);
}

server.use(function (req, res, next) {
  const origin = req.headers.origin;
  res.header(
    "Access-Control-Allow-Origin",
    isAllowedOrigin(origin) ? origin : allowedOrigins[0]
  );
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  // answer CORS preflight requests directly
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

server.use("/user", UserRoute);
server.use("/state", StateRoute);
server.use("/action", ActionRoute);
server.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

server.listen(port, () => {
  console.log("Serving on port", port);
});
