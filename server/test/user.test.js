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
const userData = [{
  email: "test@test.com",
  role: "user",
  class: "CMISE",
  group: "IE",
  username: "test",
  teacher: "first"
},{
  email: "test1@test.com",
  role: "user",
  class: "CMISE",
  group: "IE",
  username: "test1",
  teacher: "second"
},{
  email: "test3@test.com",
  role: "user",
  class: "CMISE",
  group: "IE",
  username: "test2",
  teacher: "second"
}];

describe("User model", () => {
  it("create and save user successfully", async () => {
    userData.forEach(async(element)=>{
      const newUser = new User(element);
      await newUser.setPassword(password);
      const savedUser = await newUser.save();
      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(element.email);
      expect(savedUser.username).toBe(element.username);
      expect(savedUser.role).toBe(element.role);
      expect(savedUser.class).toBe(element.class);
      expect(savedUser.group).toBe(element.group);
      expect(savedUser.teacher).toBe(element.teacher);
      expect(savedUser.salt).toBeDefined();
    })
  });

  it("filter documents by class", async () => {
    const userClass = "CMISE";
    const users = await User.find({ class: { $eq: userClass } }, "class");
    expect(users[0].class).toBe("CMISE");
  });

  it("get all distinct teachers", async () => {
    const teachers = ['first', 'second']
    const teacherResult = await User.distinct('teacher');
    expect(teacherResult).toEqual(teachers);
  })

  it("remove documents", async () => {
    userData.forEach(async(user)=>{
      const res = await User.deleteOne({ username: user.username });
      expect(res.ok).toBe(1);
    })

  });
  afterAll(() => {
    mongoose.disconnect();
  });
});
