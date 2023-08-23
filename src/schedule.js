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
      console.log(group)
      // create a cron job for the group. this job will persist until the app is reloaded or it is stopped upon group deletion
      await scheduleCronJob(allTasks, group, app)
    }
    return 0
  }
  console.log('No groups in database, not scheduling anything')
  return null
}

// create a cron job for a group. this job will persist until the app is reloaded or it is stopped upon group deletion
async function scheduleCronJob (allTasks, group, app) {
  if (group == null) {
    return null
  }

  // Before creating the JSON object, we need to convert the time (ie '12') to a cron string (ie '0 12 * * 1-5')
  // If an invalid time snuck in, log the error and don't schedule the job
  const cronTime = convertPostTimeToCron(group.postTime)
  if (cronTime == null) {
    console.log(`Error: cannot add group '${group.name}' to schedule because an invalid time was entered`)
    return null
  }

  // Schedule the eod cron job that will spawn the thread and dm the eod form to the contributors
  const eodTask = cron.schedule(cronTime, async () => {
    // Create the initial thread
    // NOTE: we still need to handle the returning thread timestamp from createPost so the app knows where to reply to
    slack.createPost(app, group)

    // Send the contributors their EOD prompt
    slack.dmUsers(app, group)
  }, {
    timezone: 'America/Los_Angeles'
  })

  // Schedule the cron job to dm the subscribers at the end of each day
  const subscriberTask = cron.schedule('59 20 * * 1-5', async () => {
    // Send DM to subscribers

  }, {
    timezone: 'America/Los_Angeles'
  })

  // create an entry for the allTasks array that bundles the group with its 2 specific cron jobs
  const entry = {
    group: group.name,
    eodTask: eodTask,
    subscriberTask: subscriberTask
  }

  // now we can find this entry later if the group needs to be deleted
  allTasks.push(entry)

  console.log(`Group '${group.name}' added to scheduler`)
  console.log(`# of groups in scheduler: ${allTasks.length}`)
  return 0
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

module.exports = { startCronJobs, scheduleCronJob, convertPostTimeToCron }
