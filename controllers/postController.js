const Tag = require('../models/tag');
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { checkAuth, requireAuth } = require('../middleware/authMiddleware');
const { findTagMid } = require('../middleware/findTagMid');

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
                const userId = await User.findOne({ username: res.locals.username }).select('_id name');
                const newComment = new Comment({
                user: userId._id,
                post: req.params.postid,
                body: req.body.comment,
                date: new Date()
                })

                await newComment.save();

                res.json({
                    comment: newComment,
                    name: userId.name
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

exports.add_post_post = [
    requireAuth,
    body('title')
        .not().isEmpty()
        .withMessage('Title cant be empty'),
    body('tag')
        .not().isEmpty()
        .withMessage('Tag cant be empty'),
    body('body')
        .not().isEmpty()
        .withMessage('Post must have text'),
    findTagMid,
    
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({
                errors: errors.array()
            })
        } else {
            let arr = [];
            let tag = '';

            try {
                if (!res.locals.tagId) {
                    const newTag = new Tag({
                        name: req.body.tag.replace(/\s+/g, ''),
                        name_lowered: req.body.tag.replace(/\s+/g, '').toLowerCase()
                    })
    
                    await newTag.save();
                    tag = newTag._id;
                } else {
                    tag = res.locals.tagId;
                }
    
                const newPost = new Post({
                    title: req.body.title,
                    body: req.body.body,
                    date: new Date(),
                    published: req.body.published,
                    tags: tag
                })
    
                await newPost.save();

                res.json({
                    postUrl: newPost.url
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