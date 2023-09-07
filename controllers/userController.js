const User = require('../models/user');
const asyncHandler = require('express-async-handler');

exports.user_create_post = asyncHandler(async(req, res, next) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    const userObj = user.toObject();

    try {
        await user.save();
        res.json({
            user: userObj
        })
    } catch (err) {
        console.log('error is: ', err);
    }
})