const Tag = require('../models/tag');
const Post = require('../models/post');
const Comment = require('../models/comment');
const asyncHandler = require('express-async-handler');

exports.post_list_get = asyncHandler(async(req, res, next) => {
    const allPosts = await Post.find({}).populate('tags').sort('-date').exec();
    res.json({
        posts: allPosts,
    })
});

exports.post_get = asyncHandler(async(req, res, next) => {
    const [post, postComments] = await Promise.all([
        Post.findById(req.params.postid).exec(),
        Comment.find({ post: req.params.id}).sort('-date').exec()
    ]);

    res.json({
        post: post,
        comments: postComments
    })
})

exports.postTag_get = asyncHandler(async(req, res, next) => {
    const tag = await Tag.findOne({ name_lowered: req.params.tag });
    const posts = await Post.find({ tags: tag._id }).populate('tags').exec();

    res.json({
        params: tag,
        posts: posts
    })
})

exports.post_add_post = asyncHandler(async(req, res, next) => {
    const post = new Post({
        title: req.body.title,
        body: req.body.body,
        date: req.body.date,
        published: req.body.published,
        tags: req.body.tags
    });

    await post.save();
    next();
})
