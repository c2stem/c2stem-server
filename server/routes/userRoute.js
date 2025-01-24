const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const catchAsync = require("../utils/CatchAsync");
const syncFlow = require("../utils/SyncFlow");
const {ProjectClientBuilder} = require('syncflow-node-client');


function verifyUser(token) {
  const user = new User;
  return user.verifyJwt(token);
}

router.post(
    "/login",
    catchAsync(async (req, res, next) => {
      return passport.authenticate(
          "local",
          {session: false},
          async (err, user, _info) => {
              if (err) {
                  console.log("error while authenticating", err);
                  return next(err);
              }

              if (user) {
                  const token = user.generateJwt();
                  const sncyFlowToken = await syncFlow.generateToken(user.username);
                  console.log(sncyFlowToken);
                  const userRole = user.role;
                  const userClass = user.class;
                  let userGroup = user.group;
                  if (!userGroup) {
                      userGroup = "All";
                  }
                  let teacher = user.teacher;
                  if (!teacher) {
                      teacher = 'All'
                  }
                  return res.status(200).json({
                      token: token,
                      sncyFlowToken: sncyFlowToken.unwrap(),
                      role: userRole,
                      class: userClass,
                      group: userGroup,
                      teacher: teacher
                  });
              }

              return res.status(200).json(_info);

          }
      )(req, res, next);
    })
);

router.post(
    "/register",
    catchAsync(async (req, res, next) => {
      let user = new User();
      const verification = verifyUser(req.headers["authorization"]);
      if (verification) {
        user.username = req.body.username;
        user.email = req.body.email;
        user.class = req.body.class;
        user.role = req.body.role;
        user.group = req.body.group;
        user.teacher = req.body.teacher;
        user.setPassword(req.body.password);
        user.save((err) => {
          if (err) {
            res.status(400).json(err);
            return;
          }

          const token = user.generateJwt();
          res.status(200).json({token});
        });
      } else {
        res.sendStatus(403);
      }
    })
);

router.post("/registerInBulk",
    catchAsync(async (req, res, next) => {
      const user = new User();
      let userData = [];
      const verification = verifyUser(req.headers["authorization"]);
      if (verification) {
        console.log(typeof req.body);
        req.body.forEach((newUser, index) => {
          const userEntry = new User();
          userEntry.username = newUser.username;
          userEntry.email = newUser.email;
          userEntry.class = newUser.class;
          userEntry.role = newUser.role;
          userEntry.group = newUser.group;
          userEntry.teacher = newUser.teacher;
          userEntry.setPassword(newUser.password);
          userData.push(userEntry);
        })
        User.insertMany(userData).then(() => {
          const token = user.generateJwt();
          res.status(200).json({token});
        }).catch((error) => {
          res.status(400).json(error);
        })
      } else {
        res.sendStatus(403);
      }
    })
);
/**
 * Returns a list of all users from a class.
 * Allowed only after token is verified.
 */
router.get(
    "/getUsersByClass/:class",
    catchAsync(async (req, res, next) => {
      const verification = verifyUser(req.headers["authorization"]);
      if (verification) {
        const filter = {class: {$eq: req.params.class}};
        const usersByClass = await User.find(
            filter,
            "username email role class group teacher"
        );
        if (!usersByClass) {
          res.status(400).json("could not retrieve the users");
          return;
        }
        res.status(200).json(usersByClass);
      } else {
        res.sendStatus(403);
      }
    })
);

/**
 * Updated the group of a user based on username sent from client.
 * Allowed only after token is verified.
 */
router.post(
    "/setUserGroup",
    catchAsync(async (req, res, next) => {
      const verification = verifyUser(req.headers["authorization"]);
      if (verification && verification !== "undefined") {
        const username = req.body.username;
        const userGroup = req.body.group;

        const filter = {username: username};
        const update = {group: userGroup};
        const filteredUser = await User.find(filter);
        if (filteredUser.length > 0) {
          let userResponse = await User.findOneAndUpdate(filter, update, {
            new: true,
          });
          if (!userResponse) {
            res.status(400).json("could not save the user");
            return;
          }
          res.status(200).json("OK");
        } else {
          res.status(400).json("could not find user");
        }
      } else {
        res.sendStatus(403);
      }
    })
);
/**
 * Returns a list of distinct teachers from the user DB.
 * Allowed only after token is verified.
 */
router.get(
    "/getTeachers",
    catchAsync(async (req, res, next) => {
      const verification = verifyUser(req.headers["authorization"]);
      if (verification && verification !== "undefined") {
        const teachers = await User.distinct('teacher');
        if (!teachers) {
          res.status(400).json("could not find teachers");
          return;
        }
        res.status(200).json(teachers);
      } else {
        res.sendStatus(403);
      }
    })
);

router.get(
    "/getUsersByTeacher/:teacher", catchAsync(async (req, res, next) => {
      const verification = verifyUser(req.headers["authorization"]);
      if (verification && verification !== "undefined") {
        const filter = {teacher: {$eq: req.params.teacher}};
        const usersByTeacher = await User.find(filter, "username email role class group teacher")
        if (!usersByTeacher) {
          res.status(400).json("could not retrieve the users");
          return;
        }
        res.status(200).json(usersByTeacher);
      } else {
        res.sendStatus(403);
      }
    })
)

router.post("/setTeacher", catchAsync(async (req, res, next) => {
  const verification = verifyUser(req.headers["authorization"]);
  if (verification && verification !== "undefined") {
    const username = req.body.username;
    const teacher = req.body.teacher;
    const filter = {username: username}
    const update = {teacher: teacher};
    const filteredUser = await User.find(filter);
    if (filteredUser.length > 0) {
      const response = await User.findOneAndUpdate(filter, update, {new: true});
      if (!response) {
        res.sendStatus(400).info("could not save the user data");
      } else {
        res.sendStatus(200).info("OK")
      }
    } else {
      res.sendStatus(400).info("could not find the user");
    }
  } else {
    res.sendStatus(403);
  }
}))
module.exports = router;
