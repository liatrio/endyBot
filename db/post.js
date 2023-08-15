const mongoose = require('mongoose')
const Schema = mongoose.Schema

// schema for posts table
/**
 * Posts contain the following fields:
 * date (Date) - Date post was posted
 * message (String) - Contents of the posted EOD
 * poster (User FK) - User entry corresponding to the poster
 * group (Group FK) - Group entry corresponding to the group of the EOD post
 */
const postSchema = Schema({
  date: Date,
  message: String,
  poster: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  group: {
    type: Schema.Types.ObjectId, ref: 'Group'
  }
})

const Post = mongoose.model('Post', postSchema)
module.exports = Post
