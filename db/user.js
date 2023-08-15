const mongoose = require('mongoose')
const Schema = mongoose.Schema

// schema for users table
/**
 * Users have the following fields:
 * slackId (String) - User's Slack ID
 * fullName (String) - User's full name from slack
 * displayName (String) - User's display name from slack
 */
const userSchema = Schema({
  slackId: String,
  fullName: String,
  displayName: String
})

const User = mongoose.model('User', userSchema)
module.exports = User
