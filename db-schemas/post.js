const mongoose = require('mongoose')
const Schema = mongoose.Schema

// schema for posts table
/**
 * Posts contain the following fields:
 * content (String) -
 */
const postSchema = Schema({
  content: [String],
  threadID: String,
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  author: String
})

const Post = mongoose.model('Post', postSchema)
module.exports = Post
