const Group = require('../db-schemas/group.js')
const cron = require('node-cron')
const slack = require('./slack')

// All code for the node-cron scheduler goes here

async function scheduleCronJob (groupID, app) {
  // Find the correct group from the provided group ID
  const group = await Group.findOne({ _id: groupID })
  if (group == null) {
    console.log(`Error: no group found with ID ${groupID}`)
    return null
  }

  // Before creating the JSON object, we need to convert the time (ie '12') to a cron string (ie '0 12 * * 1-5')
  // If an invalid time snuck in, log the error and don't schedule the job
  const cronTime = convertPostTimeToCron(group.postTime)
  if (cronTime == null) {
    console.log(`Error: cannot add group '${group.name}' to schedule because an invalid time was entered`)
    return null
  }

  // Schedule the cron job
  const task = cron.schedule(cronTime, async () => {
    // Create the initial thread
    // NOTE: we still need to handle the returning thread timestamp from createPost so the app knows where to reply to
    const threadId = slack.createPost(app, group)

    // Send the contributors their EOD prompt
    slack.dmUsers(app, group)

    // send to the subscribers
    slack.dmSubs(app, group, threadId)
  }, {
    timezone: 'America/Los_Angeles'
  })
  console.log(task)

  console.log(`Group '${group.name}' added to scheduler`)

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

module.exports = { scheduleCronJob, convertPostTimeToCron }
