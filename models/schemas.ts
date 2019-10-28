const mongoose = require('mongoose');

const MongoSavedPost = new mongoose.Schema({
    md5: String,
    url: String,
    added_at: String,
    tags: String,
    artists: String
});

export const MPost = MongoSavedPost;
