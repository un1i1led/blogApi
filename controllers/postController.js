const Tag = require('../models/tag');
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { checkAuth, requireAuth } = require('../middleware/authMiddleware');

exports.post_list_get = asyncHandler(async(req, res, next) => {
    const allPosts = await Post.find({}).populate('tags').sort('-date').exec();
    res.json({
        posts: allPosts,
    })
});

exports.post_get = [checkAuth, asyncHandler(async(req, res, next) => {
    const [post, postComments] = await Promise.all([
        Post.findById(req.params.postid).exec(),
        Comment.find({ post: req.params.id}).sort('-date').exec()
    ]);

    res.json({
        post: post,
        comments: postComments,
        isAuth: res.locals.isAuth,
        username: res.locals.username
    })
})]

exports.postTag_get = asyncHandler(async(req, res, next) => {
    const tag = await Tag.findOne({ name_lowered: req.params.tag });
    const posts = await Post.find({ tags: tag._id }).populate('tags').exec();

    res.json({
        params: tag,
        posts: posts
    })
})

exports.post_add_comment = [
    requireAuth,
    body('comment')
        .not().isEmpty()
        .withMessage('Comment has no text'),
    
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({
                errors:errors.array()
            })
        } else {
            let arr = [];
            try {
                const userId = await User.findOne({ username: res.locals.username }, '_id');
                const newComment = new Comment({
                user: userId._id,
                post: req.params.postid,
                body: req.body.comment,
                date: new Date()
                })

                await newComment.save();

                res.json({
                    comment: newComment
                })

            } catch {
                arr.push(err);
                res.json({
                    errors: arr
                })
            }
        }
    })
]