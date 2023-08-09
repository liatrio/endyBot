// const mongoose = require('mongoose');
// const { MongoClient } = require('mongodb')
const mongoose = require('mongoose')
const { Schema, model } = mongoose

// await mongoose.connect('mongodb://localhost:27017');

// general schema for our EOD posts
/**
 * each group will have the following:
 * groupname
 * array of posts that contain the date and contributor
 * each contributor will have multiple data fields
 *
 * additionally we have an array of subscribers that will
 * contain the name of the subscriber and a boolean for
 * whether or not they have been sent their post
 */
const EodSchema = new Schema({
  group: [{
    groupName: String,
    post: [{
      date: String,
      contributor: {
        name: String,
        content: String,
        OOO: Boolean, // out of office
        posted: Boolean, // whether or not the contributor posted
        sent: Boolean // whether or not a reminder was sent to the contributor
      }
    }]
  }],
  subscribers: [{
    name: String,
    sent: Boolean
  }]
})

// saving our schema into a var
const EodModel = model('eodSchema', EodSchema)
const Test = new EodModel()
await Test.save()
