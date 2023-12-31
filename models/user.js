const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    isAuthor: { type: Boolean, required: true },
    img: { type: String, required: false }
});

module.exports = mongoose.model('User', UserSchema);