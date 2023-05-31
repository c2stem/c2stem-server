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
          const userGroup = user.group;
          return res
            .status(200)
            .json({
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
  })
);

module.exports = router;
