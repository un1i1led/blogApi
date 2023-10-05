const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.user_create_post = [
    body('name')
        .trim()
        .not().isEmpty()
        .withMessage('name must be specified')
        .escape(),
    body('username')
        .trim()
        .not().isEmpty()
        .withMessage('name must be specified')
        .isAlphanumeric()
        .withMessage('username has non-alphanumeric characters')
        .escape(),
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
            res.json({
                data: 'worked'
            })
        }

    })
]