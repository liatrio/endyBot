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

module.exports = { commandParse, handleGroupDelete }
