const mongoose = require('mongoose')
const Schema = mongoose.Schema

// group schema
/**
 * Groups contain the following fields:
 * name (String) - Name of the group
 * contributors (String) - List of SlackIDs of contributors
 * subscribers (String) - List of SlackIDs of subscribers
 *
 */
const groupSchema = Schema({
  name: String,
  contributors: [String],
  subscribers: [String],
  postTime: Number,
  channel: String
})

const Group = mongoose.model('Group', groupSchema)
module.exports = Group
