const Tag = require('../models/tag');
const Post = require('../models/post');
const asyncHandler = require('express-async-handler');

exports.tag_list_get = asyncHandler(async(req, res, next) => {
    const tags = await Tag.find({}).exec();

    res.json({
        tags: tags
    })
}) 

exports.tag_slider_list = asyncHandler(async(req, res, next) => {
    const postOne = await Post.findOne({}).sort('-date').populate('tags');
    const postTwo = await Post.findOne({ 'tags': { '$ne': postOne.tags._id }}).sort('-date').populate('tags');
    const postThree = await Post.findOne({ 'tags': { '$nin': [postOne.tags._id, postTwo.tags._id] }}).sort('-date').populate('tags');

    const tags = [postOne.tags, postTwo.tags, postThree.tags];

    res.json({
        tags
    })
    
})