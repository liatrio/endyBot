const { mongoose } = require('mongoose')
const Group = require('../db-schemas/group.js')

// Put all functions interacting with the database here

// connect to database
const db = process.env.DEV == 1 ? 'db' : '127.0.0.1'
mongoose.connect(`mongodb://${db}:27017/endybot`).then(
  () => {
    console.log('Successfully connected to db')
  },
  err => {
    console.log('Could not connect to db. Error: ' + err)
  })

async function addToDB (groupJson) {
  try {
    const inserted = await Group.create(groupJson)
    return inserted._id
  } catch (err) {
    console.error('error adding to the database: ', err)
    return null
  }
}

// Deletes the group
async function deleteGroup (groupName) {
  // getGroup's "findOne" returns null if no matches were found, i.e. invalid group name
  if (await getGroup(groupName) == null) {
    return `${groupName} is not a valid group`
  }

  // if a valid groupname was passed, remove it and return results
  try {
    const result = await Group.deleteOne({ name: groupName })
    if (result.deletedCount > 0) {
      return `${groupName} was removed successfully`
    } else {
      return `${groupName} was not found`
    }
  } catch (error) {
    return `Error while deleting ${groupName}: ${error.message}`
  }
}

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

/**
 * Takes either a group name or group ID and returns the db entry for that group
 * MUST pass either groupName, groupID, or both
 *
 * @param {String} groupName
 * @param {String} groupID
 * @returns JSON of Group info from database, -1 on error.
 */
async function getGroup (groupName, groupID) {
  const searchParams = {}

  // if groupID is supplied, add it to the
  if (groupID !== undefined) {
    searchParams._id = groupID
  }

  if (groupName !== undefined) {
    searchParams.name = groupName
  }

  if (JSON.stringify(searchParams) == '{}') {
    console.log('Please supply either the groupID or group name.')
    return -1
  }

  const resGroup = await Group.findOne(searchParams)
  return resGroup
}

module.exports = { addToDB, listGroups, getGroup, deleteGroup }
