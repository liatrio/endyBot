const mongoose = require('mongoose')
const Schema = mongoose.Schema

// group schema
/**
 * Groups contain the following fields:
 * name (String) - Name of the group
 * contributors (User FK) - User entry corresponding to each contributor of the group
 * subscribers (User FK) - User entry corresponding to each of the
 */
const groupSchema = Schema({
  name: String,
  contributors: [{
    type: Schema.Types.ObjectId, ref: 'User'
  }],
  subscribers: [{
    type: Schema.Types.ObjectId, ref: 'User'
  }],
  admins: [{
    type: Schema.Types.ObjectId, ref: 'User'
  }]
})

const Group = mongoose.model('Group', groupSchema)
module.exports = Group
