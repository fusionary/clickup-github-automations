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
let tagUrl = 'https://' + core.getInput('domain') + taskEndpoint + taskID + '.json?projectIds=0&searchTerm=code review'
getRequest(tagUrl)

// Sends a PATCH request to Teamwork to set the tag on the task
const taskEndpoint = '/projects/api/v3/tasks'
let taskUrl = 'https://' + core.getInput('domain') + taskEndpoint + taskID + '.json'
patchRequest(taskUrl, '{"tagIds": []}');

core.info('Successfully updated task')





function getRequest(url) {
  // Sends a GET request to Teamwork to 
  const getOpts = {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${core.getInput('api_key')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: false
  }

  fetch(url, getOpts)
    .then(response => {if (response.status != 200) {throw 'Server returned ' + response.status}})
    .catch(err => {
      core.setFailed(err.message)
      return
    })
}

function patchRequest(url, body) {
  // Sends a PATCH request to Teamwork to 
  const patchOpts = {
    method: 'PATCH',
    headers: {
      'Authorization': `Basic ${core.getInput('api_key')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: body
  }

  fetch(url, patchOpts)
    .then(response => {if (response.status != 200) {throw 'Server returned ' + response.status}})
    .catch(err => {
      core.setFailed(err.message)
      return
    })
}

function putRequest(url, body) {
  // Sends a PUT request to Teamwork to 
  const putOpts = {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${core.getInput('api_key')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: body
  }

  fetch(url, putOpts)
    .then(response => {if (response.status != 200) {throw 'Server returned ' + response.status}})
    .catch(err => {
      core.setFailed(err.message)
      return
    })
}