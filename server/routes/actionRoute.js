const express = require('express');
const router = express.Router();
const UserAction = require('../models/userAction');
const User = require('../models/user');
const catchAsync = require('../utils/CatchAsync');

router.post('/logAction', catchAsync(async (req, res, next) => {
        let username = req.body.username;
        let type = req.body.type;
        let view = req.body.view;
        let time = req.body.time;
        let args = req.body.args;

        const userAction = new UserAction();
        userAction.username = username;
        userAction.type = type;
        userAction.view = view;
        userAction.time = time;
        userAction.args = args;

        userAction.save((err)=>{
            if(err){
                res.status(400).json(err);
                return;
            }
            res.status(200).json("success");
        });
})
);

router.get('/getInquiryActions/:username', catchAsync(async (req, res, next) => {
    const user = new User();
    const verification = user.verifyJwt(req.headers["authorization"]);
    if (!verification) return res.sendStatus(403);

    const username = req.params.username;
    const inquiryTypes = ["inquiryHypotheses", "inquiryExperiments", "inquiryFindings", "inquiryConclusions"];

    const results = {};
    for (const type of inquiryTypes) {
        const latest = await UserAction.findOne(
            { username, type },
            null,
            { sort: { time: -1 } }
        );
        if (latest) results[type] = latest;
    }

    if (Object.keys(results).length === 0) {
        return res.status(404).json({ message: "No inquiry actions found for this user." });
    }

    res.status(200).json(results);
}));

module.exports = router;