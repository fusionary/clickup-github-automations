const core = require('@actions/core')
const github = require('@actions/github')
const {getRequest, patchRequest, putRequest, postRequest} = require('./functions.js')

// Sends a GET request to Teamwork to find the given column
async function moveCard(task, columnName) {
  const taskID = task.task.id
  // Unfortunately, the v3 api doesn't include the project id in the task data like v1 does. Therefor for now, we use the v1 endpoint until this is resolved
  const taskV1Endpoint = '/tasks/'
  let taskV1Url = 'https://' + core.getInput('domain') + taskV1Endpoint + taskID + '.json'
  const project = await getRequest(taskV1Url)
  let projectID = project['todo-item']['project-id']
  core.info('Project id: ' + projectID)

  let columnID = 0
  const boardEndpoint = '/projects/'
  let boardUrl = 'https://' + core.getInput('domain') + boardEndpoint + projectID + '/boards/columns.json'
  const columns = await getRequest(boardUrl)
  columnID = columns.columns.find(column => column.name.toLowerCase() == columnName).id
  core.info('Column id: ' + columnID)

  const cardID = task.task.card.id
  
  // Check if the task has a card
  if (task.task.card !== null) {
    // Sends a PUT request to Teamwork to move the card to the "code review" column
    const cardEndpoint = '/boards/columns/cards/'
    let cardUrl = 'https://' + core.getInput('domain') + cardEndpoint + cardID + '/move.json'
    await putRequest(cardUrl, '{"cardId": ' + cardID + ',"positionAfterId": 0, "columnId": ' + columnID + '}')
  } else {
    const cardEndpoint = '/boards/columns/'
    let cardUrl = 'https://' + core.getInput('domain') + cardEndpoint + cardID + '/cards.json'
    await postRequest(cardUrl, '{"card": {"taskId": ' + taskID + '},"positionAfterId": 0}')
  }
}

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

// Sends a GET request to Teamwork to retrieve info about the task
const taskEndpoint = '/projects/api/v3/tasks/'
let taskUrl = 'https://' + core.getInput('domain') + taskEndpoint + taskID + '.json'
getRequest(taskUrl)
  .then(async task => {
    switch (github.context.payload.action) {
      case 'opened':
        core.info('PR Opened')  
      
        // Sends a GET request to Teamwork to find the "code review" tag
        const tagEndpoint = '/projects/api/v3/tags'
        let tagUrl = 'https://' + core.getInput('domain') + tagEndpoint + '.json?projectIds=0&searchTerm=code review'
        const tag = await getRequest(tagUrl)
        if (tag.tags.length > 0) {
          const tagID = tag.tags[0].id

          // Sends a PUT request to Teamwork to add the "code review" tag to the task
          let taskTagUrl = 'https://' + core.getInput('domain') + taskEndpoint + taskID + '/tags.json'
          await putRequest(taskTagUrl, `{"replaceExistingTags": false, "tagIds": [${tagID}]}`)
        }

        moveCard(task, 'code review')
        break;

      case 'closed':
        core.info('PR Opened')  
      
        moveCard(task, 'qa on stg')
        break;

      default:
        core.info('Unrecognized action ' + github.context.action)  
      
        break;
    }

  core.info('Successfully updated task')
  })
