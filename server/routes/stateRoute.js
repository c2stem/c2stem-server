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
      let hypotheses = req.body.hypotheses;
      let findings = req.body.findings;
      let conclusions = req.body.conclusions;
      let inquiryExperimentHistory = req.body.inquiryExperimentHistory;

      const userState = new UserState();

      userState.username = username;
      userState.favoriteStatus = favoriteList;
      userState.checkStatus = checkList;
      userState.designHistorySummary = dhSummary;
      userState.designHistorySummaryLength = dhSummaryLength;
      userState.hypotheses = hypotheses;
      userState.findings = findings;
      userState.conclusions = conclusions;
      userState.inquiryExperimentHistory = inquiryExperimentHistory;

      const filter = { username: username };
      const update = { favoriteStatus: favoriteList, checkStatus: checkList, designHistorySummary: dhSummary, designHistorySummaryLength: dhSummaryLength, hypotheses, findings, conclusions, inquiryExperimentHistory };
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

/**
 * Save the tile layout of one engineering design so the classroom Compare
 * view can re-render its stage later. Saved as soon as a design is run, so it
 * does not depend on the student logging out. The username comes from the
 * token; re-saving the same projectName + designKey replaces the old entry.
 */
router.post(
  "/setStageLayout",
  catchAsync(async (req, res, next) => {
    const user = new User();
    let verification;
    try {
      verification = user.verifyJwt(req.headers["authorization"]);
    } catch (err) {
      verification = undefined;
    }
    if (!verification || !verification.username) {
      res.sendStatus(403);
      return;
    }
    const { projectName, designKey, materials } = req.body;
    if (
      typeof projectName !== "string" ||
      typeof designKey !== "string" ||
      !materials ||
      typeof materials !== "object" ||
      Array.isArray(materials)
    ) {
      res.status(400).json("projectName, designKey and materials are required");
      return;
    }
    // keep only short string values: { tileName: materialName }
    const cleanMaterials = {};
    Object.entries(materials)
      .slice(0, 64)
      .forEach(([tile, material]) => {
        if (typeof tile === "string" && typeof material === "string") {
          cleanMaterials[tile.slice(0, 16)] = material.slice(0, 64);
        }
      });

    const filter = { username: verification.username };
    const entry = {
      projectName: projectName.slice(0, 256),
      designKey: designKey.slice(0, 256),
      materials: cleanMaterials,
      savedAt: new Date(),
    };
    // remove an older copy of this design (creating the state doc if needed),
    // then append the new one
    await UserState.updateOne(
      filter,
      {
        $setOnInsert: {
          favoriteStatus: [],
          checkStatus: [],
          designHistorySummary: {},
          designHistorySummaryLength: 0,
        },
        $pull: {
          stageLayouts: {
            projectName: entry.projectName,
            designKey: entry.designKey,
          },
        },
      },
      { upsert: true }
    );
    await UserState.updateOne(filter, { $push: { stageLayouts: entry } });
    res.status(200).json("success");
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
