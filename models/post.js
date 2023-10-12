const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    date: { type: Date, required: true },
    published: { type: Boolean, required: true },
    tags: { type: Schema.Types.ObjectId, ref: 'Tag', required: true }
})

PostSchema.virtual('url').get(function() {
    return `/posts/${this._id}`;
})

module.exports = mongoose.model('Post', PostSchema);