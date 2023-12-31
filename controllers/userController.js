const User = require('../models/user');
const Post = require('../models/post');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { requireAuth, requireNotAuth } = require('../middleware/authMiddleware');
const { checkAuth } = require('../middleware/authMiddleware');

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
                        isAuthor: false,
                        img: 'https://res.cloudinary.com/db1f4tqbr/image/upload/v1697657133/DEV/dz202vf08uo5hqdygl0c.png'
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
        const user = await User.findOne({ email: value }).exec();

        if (!user) {
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
                    jwt.sign({user}, 'secretkey', { expiresIn: '1d' }, (err, token) => {
                        res.json({
                            token
                        });
                    });
                } else {
                    res.json({
                        errors: [{msg: 'Password or Email is incorrect'}]
                    })
                }
            })
        }
    })
]

exports.user_login_get = [requireNotAuth, (req, res) => {
    res.json({ msg: 'authorized' });
}]

exports.verify_token_get = [requireAuth, (req, res) => {
    res.json({ msg: 'authorized', username: res.locals.username });
}]

exports.user_profile_get = [checkAuth, asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ username: req.params.username }, 'name username img').exec();
    const posts = await Post.find({ user: user._id, published: true }).sort('-date').exec()

    res.json({
        user: user,
        posts: posts,
        username: res.locals.username
    })
})]

exports.user_change_image = [requireAuth, asyncHandler(async (req, res, next) => {
    try {
        const filter = { username: res.locals.username }
        const update = { img: req.body.imgurl };

        let doc = await User.findOneAndUpdate(filter, update);


        res.json({
            msg: 'worked'
        })

    } catch (e) {
        res.json({errors: e})
    }
})]

exports.user_image_get = [requireAuth, asyncHandler(async (req, res, next) => {
    
    try {
        const user = await User.findOne({ username: res.locals.username }, 'img').exec();

        res.json({img: user})
    } catch (e) {
        res.json({errors: e})
    }
})]