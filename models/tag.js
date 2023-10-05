const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TagSchema = new Schema({
    name: { type: String, required: true },
    name_lowered: { type: String, required: true }
})

TagSchema.virtual('url').get(function() {
    return `/tags/${this._id}`;
})

module.exports = mongoose.model('Tag', TagSchema);