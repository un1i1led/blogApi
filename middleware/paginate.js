const Tag = require('../models/tag');
const Post = require('../models/post');
const asyncHandler = require('express-async-handler');

const paginateTagPosts = asyncHandler(async(req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = {}

        if (endIndex < Post.length) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }

        try {
            const tag = await Tag.findOne({ name_lowered: req.params.tag });
            results.results = await Post.find({ tags: tag._id, published: true }).sort('-date').populate('tags').skip(startIndex).limit(limit).exec();
            
            res.locals.tag = tag;
            res.locals.results = results
            next();
        } catch (e) {
            res.locals.results = e;
            res.locals.tag = e;
            next();
        }
})

const paginateAllPosts = asyncHandler(async(req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {}

    if (endIndex < Post.length) {
        results.next = {
            page: page + 1,
            limit: limit
        }
    }

    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        }
    }

    try {
        results.results = await Post.find({ published: true }).sort('-date').populate('tags').skip(startIndex).limit(limit).exec();
        
        res.locals.results = results
        next();
    } catch (e) {
        res.locals.results = e;
        next();
    }
})

module.exports = { paginateTagPosts, paginateAllPosts };