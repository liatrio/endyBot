const mongoose = require('mongoose')
const Schema = mongoose.Schema

// group tasks schema
/**
 * Group Tasks contain the following fields:
 * name (String) - ID of the group this task is associated with
 * EOD (Object) - Holds the task object to post the EOD thread
 * subscriber (Object) - Holds the task object to send EOD thread link to subscribers
 */
const TaskSchema = Schema({
  group: String,
  eod: Object,
  subscriber: Object
})

const Tasks = mongoose.model('Tasks', TaskSchema)
module.exports = Tasks
