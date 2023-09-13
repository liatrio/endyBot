const slack = require('./slack')
const database = require('./db')
const schedule = require('./schedule')

// Analyze the entire command from the user, and populate the commandObj accordingly
function commandParse (command) {
  const commandObj = {
    cmd: '',
    groupName: ''
  }
  try {
  // Split the command(string) into an array of words
    const parsed = command.split(' ')

    // If parsed is only 1 in length (ie no group name was provided), check to see if it was a command that requires a group name present. If it is, return accordingly.
    if (parsed.length === 1) {
      if (parsed[0] === 'describe' || parsed[0] === 'subscribe' || parsed[0] === 'unsubscribe' || parsed[0] === 'delete') {
      // The switch from app.js has a case for 'noGroup' that will tell the user they need to specify a group
        commandObj.cmd = 'noGroup'
        commandObj.groupName = null
        return commandObj
      }
      // If parsed is 1 in length and it's not a command that requires a group, return the command.
      commandObj.cmd = parsed[0]
      commandObj.groupName = null
      return commandObj
    }
    // If parsed is > 1 in length, return parsed[0] as the command and the rest of the array as the group name. This allows multi-worded group names to be handled.
    commandObj.cmd = parsed.shift()
    commandObj.groupName = parsed.join(' ')
    return commandObj
  } catch (error) {
    console.log(`Error while parsing command string: ${error.message}`)
    return commandObj
  }
}

// Verifies this group's name is unique, then
// creates the group in the db and schedules its tasks.
// Returns the message that will be sent to the user to
// Confirm group creation or notify them of failure
async function handleGroupCreate (view, user, eodSent, allTasks, app, usrList) {
  // Parsing the response from the modal into a JSON to send to db
  const newGroup = slack.parseCreateModal(view)

  // Verifying group name is unique
  const existGroup = await database.getGroup(newGroup.name)

  if (existGroup !== null) {
    slack.sendMessage(app, user.id, `Cannot create group: group with name ${newGroup.name} already exists.`)
    return -1
  }

  // Send new group info to db
  const groupID = await database.addToDB(newGroup)

  // Add the new group to the cron scheduler
  const group = await database.getGroup(undefined, groupID)
  schedule.scheduleCronJob(eodSent, allTasks, group, app, usrList)

  slack.sendMessage(app, user.id, `Successfully created group ${newGroup.name}.`)
  return 0
}

// Stop tasks for a group, delete the group, and notify the subscribers of the group
// This function is here to support app.js with logic
async function handleGroupDelete (app, allTasks, groupName, userID) {
  try {
    const group = await database.getGroup(groupName, undefined)
    if (group === null) {
      return `No group exists with name *${groupName}*`
    }
    // removeTasks is not async so no need to await
    schedule.removeAllTasks(allTasks, groupName)
    const res = await database.deleteGroup(groupName)
    if (res === `*${groupName}* was removed successfully`) {
      // Passing in the userID of the delete function caller so the function can print which user deleted the group
      await slack.notifySubsAboutGroupDeletion(app, group, userID)
    }
    return res
  } catch (error) {
    return `Error from handleGroupDelete for group ${groupName}: ${error.message}`
  }
}

async function iterateEodSent (app, eodSent, body) {
  if (eodSent.length === 0) {
    console.log('null eod array')
    return null
  }
  for (let i = 0; i < eodSent.length; i++) {
    if (eodSent[i].uid === body.user.id) {
      slack.eodDmUpdateDelete(app, eodSent[i].channel, eodSent[i].ts)
      slack.eodDmUpdatePost(app, eodSent[i].channel)
      return eodSent
    }
  }
  return eodSent
}

function updateUser (usrList, event) {
  // define test to filter list by
  const changedUsr = (usr) => usr.id == event.user.id

  // get index that matches test above
  const ind = usrList.findIndex(changedUsr)

  // update our user entry
  usrList[ind] = event.user
}

function addUser (usrList, event) {
  usrList.push(event.user)
}

module.exports = { commandParse, handleGroupCreate, handleGroupDelete, iterateEodSent, updateUser, addUser }
