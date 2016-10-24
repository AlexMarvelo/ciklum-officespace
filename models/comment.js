'use strict';

const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  userID: String,
  movieID: String,
  text: String,
  timestamp: String,
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
