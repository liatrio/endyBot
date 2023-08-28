const Group = require('../db-schemas/group.js')
const cron = require('node-cron')
const slack = require('./slack')
require('node-cron')

// All code for the node-cron scheduler goes here

// called from app.js on app startup. sets up cron jobs for all groups in the database
async function startCronJobs (allTasks, app) {
  const groups = await Group.find({})
  if (groups.length !== 0) {
    for (const group of groups) {
      // create a cron job for the group. this job will persist until the app is reloaded or it is stopped upon group deletion
      await scheduleCronJob(allTasks, group, app)
    }
    return 0
  }
  console.log('No groups in database, not scheduling anything')
  return null
}

/**
 * Schedules all necessary tasks for a group and adds an entry to allTasks containing the group name,
 * the thread creation task, a list of contributor tasks, and a list of subscriber tasks
 * @param {Array} allTasks
 * @param {Group_Entry} group
 * @param {Bolt_App} app
 * @returns 0 on success, null on error
 */
async function scheduleCronJob (allTasks, group, app) {
  if (group == null) {
    return null
  }

  // get user list so we can access contributor and subscriber timezones
  const usrList = await slack.getUserList(app)
  if (typeof usrList != 'object') {
    console.log('Unable to schedule cron job: Unable to get user list from Slack.')
    return null
  }

  // convert db postTime to cron time
  const cronTime = convertPostTimeToCron(group.postTime)
  if (cronTime == null) {
    console.log(`Error: cannot add group '${group.name}' to schedule because an invalid time was entered`)
    return null
  }

  // Scheduling the thread post
  const threadTask = cron.schedule(cronTime, async () => {
    // create the thread
    const ts = await slack.createPost(app, group)

    // update the DB entry with thread's ts
    const filter = { _id: group._id }
    const update = { ts }
    await Group.findOneAndUpdate(filter, update)
  }, {
    timezone: 'America/Atikokan' // EST
  })

  // Scheduling the contriutor reminders
  const contribTasks = []

  for (let i = 0; i < group.contributors.length; i++) {
    // get timezone
    const usrInfo = usrList.filter((usr) => usr.id == group.contributors[i])
    if (usrInfo.length != 1) {
      // unable to locate user, try to add other group memebers
      console.log('Error: Unable to schedule task; could not find contributor')
      continue
    }
    // getting index 0 because filter returns a list
    const tz = usrInfo[0].tz

    // creating cron task for single user
    const contribTask = cron.schedule(cronTime, async () => {
      slack.dmUsers(app, group)
    }, {
      timezone: tz
    })

    // getting uid
    const contrib = usrInfo[0].id

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
      console.log('Error: Unable to schedule task; could not find subscriber')
      continue
    }
    // getting index 0 because filter returns a list
    const tz = usrInfo[0].tz

    // creating cron task for single user
    const subTask = cron.schedule('59 20 * * 1-5', async () => {
      slack.dmSubs(app, group, group.ts)
    }, {
      timezone: tz
    })

    // getting uid
    const sub = usrInfo[0].id

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
    threadTask,
    contribTasks,
    subTasks
  }

  // now we can find this entry later if the group needs to be deleted
  allTasks.push(entry)

  return 0
}

// function to remove all the tasks for a specific group
function removeAllTasks (allTasks, groupName) {
  if (allTasks.length !== 0) {
    let i = 0
    for (const entry of allTasks) {
      if (entry.group === groupName) {
        entry.threadTask.stop()
        // loop to stop all contributor tasks
        for (const singleEod of entry.contribTasks) {
          singleEod.task.stop()
        }
        // loop to stop all subscriber tasks
        for (const singleSub of entry.subTasks) {
          singleSub.task.stop()
        }
        allTasks.splice(i, 1)
        console.log('New list length after deleting: ' + allTasks.length)
        return 1
      }
      i += 1
    }
  }
  return 0
}

// function to remove a single subscriber task (for unsubscribe functionality)
function removeSubscriberTask (allTasks, groupName, subscriber) {
  if (allTasks.length != 0) {
    // look for group
    for (const entry of allTasks) {
      if (entry.group === groupName) {
        let i = 0
        // look for subscribers task
        for (const single of entry.subscriberTask) {
          // remove
          if (single.name === subscriber) {
            single.stop()
            entry.subscriberTask.splice(i, 1)
            break
          }
          i += 1
        }
      }
    }
  }
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

module.exports = { startCronJobs, scheduleCronJob, convertPostTimeToCron, removeAllTasks, removeSubscriberTask }
