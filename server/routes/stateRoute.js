const express = require("express");
var cors = require("cors");
const router = express.Router();
const UserState = require("../models/userState");
const User = require("../models/user");
const catchAsync = require("../utils/CatchAsync");

router.post(
  "/setState",
  catchAsync(async (req, res, next) => {
    const user = new User();
    const verification = user.verifyJwt(req.headers["authorization"]);
    if (verification) {
      let username = req.body.username;
      let favoriteList = req.body.favList;
      let checkList = req.body.checkList;
      let dhSummary = req.body.designHistorySummary;
      let dhSummaryLength = req.body.designHistorySummaryLength;

      const userState = new UserState();

      userState.username = username;
      userState.favoriteStatus = favoriteList;
      userState.checkStatus = checkList;
      userState.designHistorySummary = dhSummary;
      userState.designHistorySummaryLength = dhSummaryLength;

      const filter = { username: username };
      const update = { favoriteStatus: favoriteList, checkStatus: checkList, designHistorySummary: dhSummary, designHistorySummaryLength: dhSummaryLength };
      const filteredUser = await UserState.find(filter);
      if (filteredUser.length > 0) {
        let userResponse = await UserState.findOneAndUpdate(filter, update, {
          new: true,
        });
        if (!userResponse) {
          res.status(400).json("could not save the user State");
          return;
        }
        res.status(200).json(userResponse);
      } else {
        userState.save((err) => {
          if (err) {
            res.status(400).json(err);
            return;
          }
          res.status(200).json("success");
        });
      }
    } else {
      res.sendStatus(403);
    }
  })
);

router.get(
  "/getState/:id",
  catchAsync(async (req, res, next) => {
    const user = new User();
    const verification = user.verifyJwt(req.headers["authorization"]);
    if (verification) {
      const filter = { username: { $eq: req.params.id } };
      const userState = await UserState.find(filter);
      if (!userState) {
        res.status(400).json("could not retrieve the user State");
        return;
      }
      res.status(200).json(userState);
    } else {
      res.sendStatus(403);
    }
  })
);

module.exports = router;
