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

/**
 * Takes in the ID of the user who called the list function as a String. Returns a String that is printed from app.js
 * List all group names and how many members they have
 *
 * @param {String} userID
 * @returns String that contains the entire list print
 */
async function listGroups (userID) {
  // Gather all groups from the database
  const groups = await Group.find({})
  if (groups.length == 0) {
    return 'No groups to be listed'
  }

  // Set up arrays to hold the relevant info for printing
  const subscribed = []
  const unsubscribed = []

  // Check all subscriber lists to populate arrays
  for (const group of groups) {
    if (group.subscribers.includes(userID)) {
      subscribed.push(group)
    } else {
      unsubscribed.push(group)
    }
  }

  // Set up string to be returned and printed from app.js
  let stringedResult = ''

  // Several different logic flow possibilities for building the string
  // If the user isn't subbed to any groups, notify them. Else append all subbed groups to the return string
  if (subscribed.length === 0) {
    stringedResult += 'You aren\'t subscribed to any groups\n\n'
  } else {
    stringedResult += '*Groups you are subscribed to*\n*-----------------------------------*\n'
    for (const group of subscribed) {
      stringedResult += `*${group.name}* --- Contributors: ${group.contributors.length}\n`
    }
    stringedResult += '\n'
  }

  // If the user is subbed to all groups, notify them. Else append all unsubbed groups to the return string
  if (unsubscribed.length == 0) {
    stringedResult += '\nYou\'re subscribed to every group. Way to be a team player!'
  } else {
    stringedResult += '\n*Groups you are not subscribed to*\n*---------------------------------------*\n'
    for (const group of unsubscribed) {
      stringedResult += `*${group.name}* --- Contributors: ${group.contributors.length}\n`
    }
  }

  // Return fully formatted string to be printed
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

  console.log(searchParams)

  const resGroup = await Group.findOne(searchParams)
  console.log(resGroup)
  return resGroup
}

/**
 * Takes in the name of a group and the ID of the user who called the function, both as Strings. Returns a String
 * Function adds a userID to the subscriber list of the given group (return value gets printed from app.js)
 *
 * @param {String} groupname
 * @param {String} userID
 * @returns String that denotes either a success or failure message
 */
async function addSubscriber (groupname, userID) {
  // Obtain group object that points to the database
  const group = await getGroup(groupname, undefined)

  // In case the group doesn't exist, notify the user
  if (group === null) {
    return `No group exists with name *${groupname}*`
  }

  // If the user is already subscribed to the group, notify them
  if (group.subscribers.includes(userID)) {
    return `You are already subscribed to *${groupname}*`
  }

  // Add the userID to the subscriber list and save the entry into the database
  group.subscribers.push(userID)
  group.save()

  // Notify user upon success
  return `You are now subscribed to *${groupname}*!`
}

/**
 * Takes in the name of a group and the ID of the user who called the function, both as Strings. Returns a String
 * Function removes a userID from the subscriber list of the given group (return value gets printed from app.js)
 *
 * @param {String} groupname
 * @param {String} userID
 * @returns String that denotes either a success or failure message
 */
async function removeSubscriber (groupname, userID) {
  // Obtain group object thayt points to the database
  const group = await getGroup(groupname, undefined)

  // In case the group doesn't exist, notify the user
  if (group === null) {
    return `No group exists with name *${groupname}*`
  }

  // As long as the user is subscribed to the group, unsubscribe them (remove ID from subscriber list)
  if (group.subscribers.includes(userID)) {
    // Set the subscriber list equal to itself, but without the userID in it, and save the entry into the database
    group.subscribers = group.subscribers.filter(item => item !== userID)
    group.save()

    // Notify user upon success
    return `You have unsubscribed from *${groupname}*, and will no longer receive messages about the group. Come back any time!`
  }

  // If the user was initially unsubscribed from the group, do nothing and notify them
  return `You were already unsubscribed from *${groupname}*`
}

module.exports = { addToDB, listGroups, getGroup, addSubscriber, removeSubscriber }
