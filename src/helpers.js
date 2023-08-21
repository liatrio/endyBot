// put any helpers here that don't have any other good spot to go
/**
 *
 * @param {*} message - Should be in the form 'It's time to write your EOD post for \*[GROUP NAME]!\*"
 * @returns The group name from the message above. Will return -1 on error.
 */
function groupNameFromMessage (message) {
  const splitMessage = message.split('*')
  if (splitMessage.length != 3) {
    // message was not 'It's time to write your EOD post for *[GROUPNAME]!*
    return -1
  }
  const groupName = splitMessage[1]
  if (groupName.length < 2) {
    // group name was empty
    return -1
  }
  return groupName.substring(0, groupName.length - 1)
}

module.exports = { groupNameFromMessage }
