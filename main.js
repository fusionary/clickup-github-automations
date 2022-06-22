const core = require('@actions/core')
const github = require('@actions/github')
const { GitHub } = require('@actions/github/lib/utils')
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

  // Check if the task has a card
  if (task.task.card !== null) {
    // Sends a PUT request to Teamwork to move the card to the "code review" column
    const cardID = task.task.card.id
    const cardEndpoint = '/boards/columns/cards/'
    let cardUrl = 'https://' + core.getInput('domain') + cardEndpoint + cardID + '/move.json'
    await putRequest(cardUrl, '{"cardId": ' + cardID + ',"positionAfterId": 0, "columnId": ' + columnID + '}')
  } else {
    // Add card to column
    const cardEndpoint = '/boards/columns/'
    let cardUrl = 'https://' + core.getInput('domain') + cardEndpoint + columnID + '/cards.json'
    await postRequest(cardUrl, '{"card": {"taskId": ' + taskID + '},"positionAfterId": 0}')
  }
}

let taskIDs = []
if (!core.getInput('task_id')) {
  // No task override. Look for task id in PR description
  const prBody = github.context.payload.pull_request?.body
  if (prBody) {
    const bodyLines = prBody.split('\n')
    bodyLines.forEach(line => {
      console.log(line)
      const regex = /https:\/\/fusionary\.teamwork\.com\/#\/tasks\/(\d+)/
      let matches = line.match(regex)
      if (matches?.length == 2) {
        taskIDs.push(matches[1])
      }
    })

    // If there's no description or the first line isn't a task id
    if (taskIDs.length === 0) {
      // Description may have been intentionally left empty or not include
      // a task id. Exit with success code
      process.exit(0)
    }
  } else {
    core.setFailed('Could not retrieve PR body')
    process.exit(0)
  }
} else {
  taskIDs = [core.getInput('task_id')]
}

core.info('Found task ID(s) ' + taskIDs)

taskIDs.forEach(taskID => {
  // Sends a GET request to Teamwork to retrieve info about the task
  const taskEndpoint = '/projects/api/v3/tasks/'
  let taskUrl = 'https://' + core.getInput('domain') + taskEndpoint + taskID + '.json'
  getRequest(taskUrl)
    .then(async task => {
      // Sends a GET request to Teamwork to find the "code review" tag
      let tagID = 0;
      const tagEndpoint = '/projects/api/v3/tags'
      let tagUrl = 'https://' + core.getInput('domain') + tagEndpoint + '.json?projectIds=0&searchTerm=code review'
      const tag = await getRequest(tagUrl)
      if (tag.tags.length > 0) {
        tagID = tag.tags[0].id
      }
      
      switch (github.context.payload.action) {
        case 'opened':
          core.info('PR Opened')

          // Sends a PUT request to Teamwork to add the "code review" tag to the task
          let taskTagUrl = 'https://' + core.getInput('domain') + taskEndpoint + taskID + '/tags.json'
          await putRequest(taskTagUrl, `{"replaceExistingTags": false, "tagIds": [${tagID}]}`)

          moveCard(task, 'code review')
          
          break;

        case 'closed':
          core.info('PR Closed')  
        
          // Removes the "code review" tag from the task
          // TODO: Update this when it's added to v3 API
          let removeTagUrl = 'https://' + core.getInput('domain') + '/task/' + taskID + '/tags.json'
          await putRequest(removeTagUrl, `{"removeProvidedTags": true, "tags":{"content": "Code Review"}}`)

          moveCard(task, 'qa on stg')

          break;

        default:
          core.info('Unrecognized action ' + github.context.action)  
        
          break;
      }

    core.info('Successfully updated task ' + taskID)
    })
})
