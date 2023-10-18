const Tag = require('../models/tag');
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { checkAuth, requireAuth } = require('../middleware/authMiddleware');
const { findTagMid } = require('../middleware/findTagMid');
const { paginateTagPosts, paginateAllPosts } = require('../middleware/paginate');

exports.post_list_get = [paginateAllPosts, (req, res) => {
    if (!res.locals.results) {
        res.json('didnt work')
    }

    res.json({
        results: res.locals.results.results
    })
}]

exports.post_get = [checkAuth, asyncHandler(async(req, res, next) => {
    const [post, postComments] = await Promise.all([
        Post.findById(req.params.postid).populate('user tags', 'name username').exec(),
        Comment.find({ post: req.params.id}).sort('-date').exec()
    ]);

    res.json({
        post: post,
        comments: postComments,
        isAuth: res.locals.isAuth,
        username: res.locals.username
    })
})]

exports.postTag_get = [paginateTagPosts, (req, res) => {

    if (!res.locals.tag) {
        res.json('didnt work')
    }

    res.json({
        tagId: res.locals.tag._id,
        results: res.locals.results.results
    })
}]

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

                const user = await User.findOne({ username: res.locals.username }, '_id').exec();
    
                const newPost = new Post({
                    user: user._id,
                    title: req.body.title,
                    body: req.body.body,
                    date: new Date(),
                    published: req.body.published,
                    tags: tag,
                    img: req.body.pathUrl
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

exports.spotlight_get = asyncHandler(async (req, res, next) => {
    const post = await Post.findOne({ published: true }).sort('-date').populate('tags').exec();

    res.json({
        post: post
    })
})

exports.delete_post = asyncHandler(async (req, res, next) => {
    try {
        const deletedPost = await Post.deleteOne({ _id: req.params.postid});
        const deletedComments = await Comment.deleteMany({ post: req.params.postid });

        res.json({ msg: 'deleted' });
    } catch (e) {
        res.json({ error: e });
    }
})