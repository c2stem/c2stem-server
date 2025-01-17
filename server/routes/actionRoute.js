const express = require('express');
const router = express.Router();
const UserAction = require('../models/userAction');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');

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

module.exports = router;