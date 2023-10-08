const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { response } = require('express');

exports.user_create_post = [
    body('name')
        .trim()
        .not().isEmpty()
        .withMessage('Name must be specified')
        .escape(),
    body('username')
        .trim()
        .not().isEmpty()
        .withMessage('Username must be specified')
        .isAlphanumeric()
        .withMessage('username has non-alphanumeric characters')
        .escape(),
    body('username').custom(async value => {
        const user = await User.find({username: value }).exec();

        if (user.length > 0) {
            throw new Error('Username already in use');
        } else {
            return true;
        }
    }),
    body('email')
        .isEmail()
        .withMessage('Email must be a valid email'),
    body('email').custom(async value => {
        const user = await User.find({ email: value }).exec();

        if (user.length > 0) {
            throw new Error('Email already in use');
        }
    }),
    body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password must be at least six characters long'),
    body('confirm').custom((value, { req }) => {
        if (value === req.body.password) {
            return true
        } else {
            throw new Error ('Passwords dont match');
        }
    }),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({
                errors:errors.array()
            })
        } else {
            bcrypt.hash(req.body.password, 10, async(err, hashedPassword) => {
                let arr = []
                try {
                    const user = new User({
                        email: req.body.email,
                        name: req.body.name,
                        username: req.body.username,
                        password: hashedPassword,
                        isAuthor: false
                    });

                    await user.save();
                    res.json({
                        data: '200'
                    })
                } catch {
                    arr.push(err);
                    res.json({
                        errors: arr
                    })
                }
            })
        }

    })
]

exports.user_login = [
    body('email')
        .isEmail()
        .withMessage('You must enter a valid email'),
    body('password')
        .not().isEmpty()
        .withMessage('You must enter a password'),
    body('email').custom(async value => {
        const user = await User.find({ email: value }).exec();

        if (user.length < 0) {
            throw new Error('There is no account associated with that email');
        } else {
            return true;
        }
    }),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({
                errors: errors.array()
            })
        } else {
            const user = await User.findOne({ email: req.body.email }).exec();
            bcrypt.compare(req.body.password, user.password).then(function(result) {
                if (result) {
                    jwt.sign({user}, 'secretkey', { expiresIn: '1h' }, (err, token) => {
                        res.json({
                            token
                        });
                    });
                } else {
                    res.json({
                        errors: {msg: 'Password or Email is incorrect'}
                    })
                }
            })
        }
    })
]

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {

        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        next();
    } else {
        res.json({
            msg: 'Forbidden'
        });
    }
}