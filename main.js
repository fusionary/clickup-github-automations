const core = require('@actions/core')
const github = require('@actions/github')
const fetch = require('node-fetch')

let taskID = core.getInput('task_id')
if (!taskID) {
  // No task override. Look for task id in PR description
  const prBody = github.context.payload.pull_request?.body
  if (prBody) {
    taskID = prBody.slice(0, prBody.indexOf('\n')).replace('#', '')
    // If there's no description or the first line isn't a task id
    if (taskID === '') {
      // Description may have been intentionally left empty. Exit with success code
      return
    }
  } else {
    core.setFailed('Could not retrieve PR body')
    return
  }
}

core.info('Found task ID ' + taskID)
const endpoint = '/projects/api/v3/tasks/'
let url = 'https://' + core.getInput('domain') + endpoint + taskID + '/complete.json'

// Sends a PUT request to Teamwork to set the task as complete
const putOpts = {
  method: 'PUT',
  headers: {
    'Authorization': `Basic ${core.getInput('api_key')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  redirect: 'follow',
  body: 'false'
}

fetch(url, putOpts)
  .then(response => {if (response.status != 204) {throw 'Server returned ' + response.status}})
  .catch(err => {
    core.setFailed(err.message)
    return
  })

core.info('Successfully set task as completed')
