const core = require('@actions/core')
const github = require('@actions/github')
const {getRequest, patchRequest, putRequest} = require('./functions.js')

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

// Sends a GET request to Teamwork to find the "code review" tag
const tagEndpoint = '/projects/api/v3/tags'
let tagUrl = 'https://' + core.getInput('domain') + tagEndpoint + taskID + '.json?projectIds=0&searchTerm=code review'
tag = await getRequest(tagUrl)
tagID = tag.tags[0].id

// Sends a PUT request to Teamwork to add the "code review" tag to the task
const taskEndpoint = '/projects/api/v3/tasks/'
let taskTagUrl = 'https://' + core.getInput('domain') + taskEndpoint + taskID + '/tags.json'
await putRequest(taskTagUrl, `{"replaceExistingTags": false, "tagIds": [${tagID}]}`)

// Sends a PATCH request to Teamwork to set the tag on the task
let taskUrl = 'https://' + core.getInput('domain') + taskEndpoint + taskID + '.json'
await patchRequest(taskUrl, '{"tagIds": []}')





core.info('Successfully updated task')
