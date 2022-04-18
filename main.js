const core = require('@actions/core')
const github = require('@actions/github')
const {getRequest, patchRequest, putRequest, postRequest} = require('./functions.js')

let taskID = core.getInput('task_id')
if (!taskID) {
  // No task override. Look for task id in PR description
  const prBody = github.context.payload.pull_request?.body
  if (prBody) {
    taskID = prBody.slice(0, prBody.indexOf('\n')).replace('#', '')
    // If there's no description or the first line isn't a task id
    if (taskID === '' || isNaN(parseInt(taskID))) {
      // Description may have been intentionally left empty or not include
      // a task id. Exit with success code
      process.exit(0)
    }
  } else {
    core.setFailed('Could not retrieve PR body')
    process.exit(0)
  }
}

core.info('Found task ID ' + taskID)

let columnName = ''
switch (github.event.action) {
  case 'opened':
    columnName = 'code review'
    break;

  case 'closed':
    columnName = 'qa on stg'
    break;

  default:
    break;
}

// Sends a GET request to Teamwork to retrieve info about the task
const taskEndpoint = '/projects/api/v3/tasks/'
let taskUrl = 'https://' + core.getInput('domain') + taskEndpoint + taskID + '.json'
const task = await getRequest(taskUrl)

// Sends a GET request to Teamwork to find the "code review" tag
const tagEndpoint = '/projects/api/v3/tags'
let tagUrl = 'https://' + core.getInput('domain') + tagEndpoint + taskID + '.json?projectIds=0&searchTerm=code review'
tag = await getRequest(tagUrl)
if (tag.tags.length > 0) {
  const tagID = tag.tags[0].id

  // Sends a PUT request to Teamwork to add the "code review" tag to the task
  let taskTagUrl = 'https://' + core.getInput('domain') + taskEndpoint + taskID + '/tags.json'
  await putRequest(taskTagUrl, `{"replaceExistingTags": false, "tagIds": [${tagID}]}`)
}

// Sends a GET request to Teamwork to find the "code review" column
let columnID = 0
const boardEndpoint = '/projects/'
let boardUrl = 'https://' + core.getInput('domain') + boardEndpoint + projectID + '/boards/columns.json'
columns = await getRequest(boardUrl)
columns.forEach(column => {
  if (column.name.toLowerCase() == columnName) {
    columnID = column.id
  }
});

// Check if the task has a card
if (task.task.card !== null) {
  // Sends a PUT request to Teamwork to move the card to the "code review" column
  const cardEndpoint = 'boards/columns/cards/'
  let cardUrl = 'https://' + core.getInput('domain') + cardEndpoint + cardID + 'move.json'
  await putRequest(cardUrl, '{"cardId": ' + task.task.card.id + ',"positionAfterId": 0, "columnId": ' + columnID + '}')
} else {
  await postRequest(cardUrl, '{"card": {"taskId": ' + taskID + '},"positionAfterId": 0}')
}



core.info('Successfully updated task')
