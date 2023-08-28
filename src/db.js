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

/**
 * Takes a group name as a String, returns a String (return value is printed from app.js)
 * Displays relevant information about specified group
 *
 * @param {String} groupname
 * @returns String
 */
async function describeGroup (groupname) {
  // Obtain group object thayt points to the database
  const group = await getGroup(groupname, undefined)

  // In case the group doesn't exist, notify the user
  if (group === null) {
    return `No group exists with name *${groupname}*`
  }

  // Examine group object and set up string to be returned
  try {
    // Set up string to be returned and printed from app.js
    let stringedResult = `Here's all the information for *${groupname}*\n\n`

    // Display all contributors of the group
    stringedResult += '*Contributors*: '
    for (const user of group.contributors) {
      stringedResult += `<@${user}>  `
    }

    // Display all subscribers of the group
    stringedResult += '\n\n*Subscribers*: '
    for (const user of group.subscribers) {
      stringedResult += `<@${user}>  `
    }

    // Display the channel the group is tied to
    stringedResult += `\n\n*Channel*: <#${group.channel}>\n`

    // Display the time that the EOD jobs run
    // TODO: Refactor this once we have timezones done... or just leave as PST
    stringedResult += `\n*EOD Time*: ${group.postTime}:00 PST\n`

    return stringedResult
  } catch (error) {
    return `Error while describing group ${groupname}: ${error.message}`
  }
}

module.exports = { addToDB, listGroups, getGroup, deleteGroup, describeGroup }
