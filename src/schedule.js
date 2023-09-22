const Group = require('../db-schemas/group.js')
const cron = require('node-cron')
const slack = require('./slack')
const db = require('./db')
const logger = require('pino')(({
  transport: {
    target: 'pino-pretty'
  },
  level: 'debug' // setting to this level in prod to help find bugs
}))
require('node-cron')

let reminderSent

// All code for the node-cron scheduler goes here

// called from app.js on app startup. sets up cron jobs for all groups in the database
async function startCronJobs (eodSent, allTasks, app, usrList) {
  const groups = await Group.find({})
  if (groups.length !== 0) {
    for (const group of groups) {
      logger.info(`Creating cron jobs for group ${group.name}`)
      // create a cron job for the group. this job will persist until the app is reloaded or it is stopped upon group deletion
      await scheduleCronJob(eodSent, allTasks, group, app, usrList)
    }
    return 0
  }
  logger.info('No groups in database, not scheduling anything')
  return null
}

/**
 * Schedules all necessary tasks for a group and adds an entry to allTasks containing the group name,
 * the reset posted task, a list of contributor tasks, and a list of subscriber tasks
 * @param {Array} allTasks
 * @param {Group_Entry} group
 * @param {Bolt_App} app
 * @returns 0 on success, null on error
 */
async function scheduleCronJob (eodSent, allTasks, group, app, usrList) {
  if (group == null) {
    return null
  }

  try {
    // convert db postTime to cron time
    const cronTime = convertPostTimeToCron(group.postTime)
    if (cronTime == null) {
      logger.warn(`Cannot add group '${group.name}' to schedule because an invalid time was entered`)
      return null
    }

    // Scheduling task to reset the "posted" variable for the group and each contributor
    const resetTask = cron.schedule('59 23 * * 1-5', async () => {
      const curGroup = db.getGroup(group.name) // getting most up to gate version of the group
      db.updateGroupPosted(curGroup)
      for (let i = 0; i < curGroup.contributors.length; i++) {
        db.updateUserPosted(curGroup.contributors[i].name, curGroup.name, false)
      }
    }, {
      timezone: 'America/Los_Angeles' // PST-- Setting it to this to try to limitt cases of late-night EOD posts going to the wrong thread
    })

    // Scheduling the contriutor reminders
    const contribTasks = []

    for (let i = 0; i < group.contributors.length; i++) {
      // get timezone
      const usrInfo = usrList.filter((usr) => usr.id == group.contributors[i].name)
      if (usrInfo.length != 1) {
        // unable to locate user, try to add other group memebers
        logger.error('Unable to schedule task; could not find contributor')
        continue
      }
      // getting index 0 because filter returns a list
      const tz = usrInfo[0].tz

      // getting uid
      const contrib = usrInfo[0].id

      // creating cron task for single user
      const contribTask = cron.schedule(cronTime, async () => {
        const curGroup = db.getGroup(group.name)
        reminderSent = await slack.dmUsers(app, curGroup, contrib)
        eodSent.push(reminderSent)
      }, {
        timezone: tz
      })

      const contribObj = {
        name: contrib,
        task: contribTask
      }

      contribTasks.push(contribObj)
    }

    // Scheduling the subscriber messages
    const subTasks = []

    for (let i = 0; i < group.subscribers.length; i++) {
      // get timezone
      const usrInfo = usrList.filter((usr) => usr.id == group.subscribers[i])
      if (usrInfo.length != 1) {
        // unable to locate user, try to add other group memebers
        logger.error('Unable to schedule task; could not find subscriber')
        continue
      }
      // getting index 0 because filter returns a list
      const tz = usrInfo[0].tz

      // getting uid
      const sub = usrInfo[0].id

      // creating cron task for single user. Subs will get the link at 8pm local time
      const subTask = cron.schedule('0 20 * * 1-5', async () => {
        const curGroup = db.getGroup(group.name)
        slack.dmSubs(app, curGroup, sub, curGroup.ts)
      }, {
        timezone: tz
      })

      const subObj = {
        name: sub,
        task: subTask
      }

      subTasks.push(subObj)
    }

    // adding all of this group's tasks to an entry to be stored in allTasks
    // create an entry for the allTasks array that bundles the group with its 2 specific cron jobs
    const entry = {
      group: group.name,
      resetTask,
      contribTasks,
      subTasks
    }

    logger.info(`Scheduled tasks for group ${group.name}: ${entry}`)

    // now we can find this entry later if the group needs to be deleted
    allTasks.push(entry)

    return 0
  } catch (error) {
    logger.error(`Error while scheduling cron job: ${error.message}`)
  }
}

// function to remove all the tasks for a specific group
function removeAllTasks (allTasks, groupName) {
  let i = 0
  for (const entry of allTasks) {
    if (entry.group === groupName) {
      entry.resetTask.stop()
      // loop to stop all contributor tasks
      for (const singleEod of entry.contribTasks) {
        singleEod.task.stop()
      }
      // loop to stop all subscriber tasks
      for (const singleSub of entry.subTasks) {
        singleSub.task.stop()
      }
      allTasks.splice(i, 1)
      break
    }
    i += 1
  }

  logger.info(`Removed tasks for group ${groupName}`)
}

// function to remove a single subscriber task (for unsubscribe functionality)
async function addSubscriberTask (app, allTasks, groupName, subscriber, usrList) {
  try {
    const group = await db.getGroup(groupName, undefined)
    if (group === null) {
      return
    }

    // look for users timezone
    const usrInfo = usrList.filter((usr) => usr.id == subscriber)
    if (usrInfo.length != 1) {
      // unable to locate user, try to add other group memebers
      logger.error('Unable to schedule task; could not find subscriber')
      return
    }

    // getting index 0 because filter returns a list
    const tz = usrInfo[0].tz

    // creating cron task for single user. Subs will get the link at 8pm local time
    const subTask = cron.schedule('0 20 * * 1-5', async () => {
      slack.dmSubs(app, group, subscriber, group.ts)
    }, {
      timezone: tz
    })

    const subObj = {
      name: subscriber,
      task: subTask
    }

    // now that we've scheduled the task and saved it in an obj
    for (const entry of allTasks) {
      if (entry.group === groupName) {
        entry.subTasks.push(subObj)
        break
      }
    }

    logger.info(`Created subscriber tasks for user ${subscriber} in group ${groupName}`)
  } catch (error) {
    logger.error(`Error while adding subscriber task: ${error.message}`)
  }
}

// function to remove a single subscriber task (for unsubscribe functionality)
function removeSubscriberTask (allTasks, groupName, subscriber) {
  // look for group
  for (const entry of allTasks) {
    if (entry.group === groupName) {
      let i = 0
      // look for subscribers task
      for (const single of entry.subTasks) {
        // remove
        if (single.name === subscriber) {
          single.task.stop()
          entry.subTasks.splice(i, 1)
          break
        }
        i += 1
      }
    }
  }
  logger.info(`Removed subscriber tasks for user ${subscriber} in group ${groupName}`)
}

function convertPostTimeToCron (hour) {
  // No matter whether the hour value comes in like "4" or "04", this will convert it to "04" and then map it back to a valid cron time
  // Times should always be coming in as 2 digits, but just in case something slips through, this prevents things from breaking
  const cronMapping = {
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    '00': '0',
    '01': '1',
    '02': '2',
    '03': '3',
    '04': '4',
    '05': '5',
    '06': '6',
    '07': '7',
    '08': '8',
    '09': '9',
    10: '10',
    11: '11',
    12: '12',
    13: '13',
    14: '14',
    15: '15',
    16: '16',
    17: '17',
    18: '18',
    19: '19',
    20: '20',
    21: '21',
    22: '22',
    23: '23'
  }

  const cronHour = cronMapping[hour]

  // This will tell the schedule to run at the specified hour, on the hour, Monday-Friday
  if (cronHour == null) {
    return null
  }
  return `0 ${cronHour} * * 1-5`
}

module.exports = { startCronJobs, scheduleCronJob, convertPostTimeToCron, removeAllTasks, addSubscriberTask, removeSubscriberTask }
