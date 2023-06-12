const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const catchAsync = require("../utils/CatchAsync");

router.post(
  "/login",
  catchAsync(async (req, res, next) => {
    return passport.authenticate(
      "local",
      { session: false },
      (err, user, _info) => {
        if (err) {
          console.log("error while authenticating", err);
          return next(err);
        }

        if (user) {
          const token = user.generateJwt();
          const userRole = user.role;
          const userClass = user.class;
          let userGroup = user.group;
          if(!userGroup){
              userGroup = "All";
          }
          return res.status(200).json({
            token: token,
            role: userRole,
            class: userClass,
            group: userGroup,
          });
        }

        return res.status(400).info;
      }
    )(req, res, next);
  })
);

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    const user = new User();
    const verification = user.verifyJwt(req.headers["authorization"]);
    if (verification) {
      user.username = req.body.username;
      user.email = req.body.email;
      user.class = req.body.class;
      user.role = req.body.role;
      user.setPassword(req.body.password);
      user.save((err) => {
        if (err) {
          res.status(400).json(err);
          return;
        }

        const token = user.generateJwt();
        res.status(200).json({ token });
      });
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
    const user = new User();
    const verification = user.verifyJwt(req.headers["authorization"]);
    if (verification) {
      const filter = { class: { $eq: req.params.class } };
      const usersByClass = await User.find(
        filter,
        "username email role class group"
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
    const user = new User();
    const verification = user.verifyJwt(req.headers["authorization"]);
    if (verification && verification !== "undefined") {
      const username = req.body.username;
      const userGroup = req.body.group;

      const filter = { username: username };
      const update = { group: userGroup };
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
module.exports = router;
