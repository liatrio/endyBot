const { mongoose } = require('mongoose')
const Group = require('../db-schemas/group.js')

// Put all functions interacting with the database here

async function addToDB (groupJson) {
  try {
    const inserted = await Group.create(groupJson)
    return inserted._id
  } catch (err) {
    console.error('error adding to the database: ', err)
    return null
  }
}

// connect to database
const db = process.env.DEV == 1 ? 'db' : '127.0.0.1'
mongoose.connect(`mongodb://${db}:27017/endybot`).then(
  () => {
    console.log('Successfully connected to db')
  },
  err => {
    console.log('Could not connect to db. Error: ' + err)
  }
)

// List all group names and how many members they have
async function listGroups () {
  const groups = await Group.find({})
  if (groups.length == 0) {
    return 'No groups to be listed'
  }

  let stringedResult = ''

  for (const group of groups) {
    stringedResult += group.name + ' --- Num Members: ' + group.contributors.length + '\n'
  }
  return stringedResult
}

module.exports = { addToDB, listGroups }
