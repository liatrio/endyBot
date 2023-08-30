const slack = require('./slack')
const database = require('./db')
const schedule = require('./schedule')

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
    if (eodSent[i].id === body.user.id) {
      slack.eodDmUpdateDelete(app, eodSent[i].channel, eodSent[i].ts)
      slack.eodDmUpdatePost(app, eodSent[i].channel)
      return eodSent
    }
  }
  return -1
}

module.exports = { handleGroupDelete, iterateEodSent }
