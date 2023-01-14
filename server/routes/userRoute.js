const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const catchAsync = require('../utils/CatchAsync');

router.post('/login', catchAsync(async (req, res, next) => {
    return passport.authenticate('local', { session: false }, (err, user, _info) => {
        if(err) {
          console.log("error while authenticating", err);
          return next(err);
        }
    
        if(user) {
            const token = user.generateJwt();
            const userRole = user.role;
            const userClass = user.class;
            console.log("passed auth", token, user);
            return res.status(200).json({ token: token, role: userRole, class: userClass });
        }
    
        return res.status(400).info;
      })(req, res, next);
}));

module.exports = router;