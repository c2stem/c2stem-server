const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "User",
  },
  class: {
    type: String,
    required: true,
    default: "SPICE",
  },
  group: {
    type: String,
    required: true,
    default: "All",
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  hash: String,
  salt: String,
});

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha1")
    .toString("hex");
};

userSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha1")
    .toString("hex");
  return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
      class: this.class,
      exp: parseInt(expiry.getTime() / 1000),
    },
    process.env.JWT_SECRET_KEY
  );
};

/**
 * The method is to verify if the user is logged in before making any requests to the server.
 * All requests without the token are rejected.
 * @param {String} authorization
 * @returns user data or error
 */
userSchema.methods.verifyJwt = function (authorization) {
  if (typeof authorization !== "undefined") {
    const authToken = authorization.split(" ")[1];
    const verification = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
    return verification;
  } else {
    return undefined;
  }
};

module.exports = mongoose.model("User", userSchema);
