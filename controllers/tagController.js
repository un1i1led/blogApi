const Tag = require('../models/tag');
const asyncHandler = require('express-async-handler');

exports.tag_slider_list = asyncHandler(async(req, res, next) => {
    const tags = await Tag.find({}).limit(3).exec();

    res.json({
        tags: tags
    })
})