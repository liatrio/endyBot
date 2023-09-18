const mongoose = require('mongoose')
const Schema = mongoose.Schema

// group schema
/**
 * Groups contain the following fields:
 * name (String) - Name of the group
 * contributors (String) - List of SlackIDs of contributors
 * subscribers (String) - List of SlackIDs of subscribers
 * postTime (Number) - The number of the hour at which posts should be sent (ex. 4 PM would be 16, 11 AM would be 11)
 * channel (String) - The ID of the channel in which thread posts should be sent to
 * ts (String) - The timestamp/ID of the main thread posts for the day (Should be updated every day when a new thread is created) (Slack expects this as a string)
 */
const groupSchema = Schema({
  name: String,
  contributors: [String],
  subscribers: [String],
  postTime: Number,
  channel: String,
  ts: String,
  posted: Boolean
})

const Group = mongoose.model('Group', groupSchema)
module.exports = Group
