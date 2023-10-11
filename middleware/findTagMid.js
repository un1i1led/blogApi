const Tag = require('../models/tag');
const asyncHandler = require('express-async-handler');

const findTagMid = asyncHandler(async (req, res, next) => {
    const tag = req.body.tag;
    const removeSpaces = tag.replace(/\s+/g, '');
    const tagLower = removeSpaces.toLowerCase();

    const tagId = await Tag.findOne({ name_lowered: tagLower }).select('_id');
        
    if (!tagId) {
        next();
    } else {
        res.locals.tagId = tagId._id;
        next();
    }
})

module.exports = { findTagMid };