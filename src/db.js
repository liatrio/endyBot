// Put all functions interacting with the database here
const Group = require('../db-schemas/group')

async function addToDB (groupJson) {
  try {
    const inserted = await Group.create(groupJson)
    return inserted._id
  } catch (err) {
    console.error('error adding to the database: ', err)
    return null
  }
}

module.exports = { addToDB }
