const Post = require('../models/post');
const Comment = require('../models/comment');
const asyncHandler = require('express-async-handler');

exports.post_list_get = asyncHandler(async(req, res, next) => {
    const allPosts = await Post.find({}).sort('-date').exec();
    const message = 'hello';
    res.json({
        allPosts: allPosts,
    })
});

exports.post_get = asyncHandler(async(req, res, next) => {
    const [post, postComments] = await Promise.all([
        Post.findById(req.params.id).exec(),
        Comment.find({ post: req.params.id}).sort('-date').exec()
    ]);

    res.json({
        post: post,
        comments: postComments
    })
})

exports.post_add_post = asyncHandler(async(req, res, next) => {
    const post = new Post({
        title: req.body.title,
        body: req.body.body,
        date: req.body.date,
        published: req.body.published
    });

    await post.save();
    next();
})