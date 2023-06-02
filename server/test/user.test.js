const mongoose = require("mongoose");
const User = require("../models/user");
const crypto = require("crypto");

mongo_uri = "mongodb://localhost:27017/c2stem-class";

mongoose
  .connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN!");
  })
  .catch((err) => {
    console.log("MONGO CONNECTION ERROR!!");
    console.log(err);
  });

const password = "test";
const userData = {
  email: "test@test.com",
  role: "user",
  class: "CMISE",
  group: "IE",
  username: "test",
};

describe("User model", () => {
  it("create and save user successfull", async () => {
    const newUser = new User(userData);
    await newUser.setPassword(password);
    const savedUser = await newUser.save();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.role).toBe(userData.role);
    expect(savedUser.class).toBe(userData.class);
    expect(savedUser.group).toBe(userData.group);
    expect(savedUser.salt).toBeDefined();
  });

  it("remove a document", async () => {
    const res = await User.deleteOne({ username: userData.username });
    expect(res.ok).toBe(1);
  });

  it("filter documents by class", async () => {
    const userClass = "CMISE";
    const users = await User.find({ class: { $eq: userClass } }, "class");
    expect(users[0].class).toBe("CMISE");
  });
  afterAll(() => {
    mongoose.disconnect();
  });
});
