const core = require('@actions/core')
const github = require('@actions/github')
const fetch = require('node-fetch')

const prBody = github.context.payload.pull_request?.body
console.log(github.context)
if (!prBody) {
  core.setFailed('Could not retrieve PR body')
  break
}
const taskID = prBody.slice(0, prBody.indexOf('\n'))
const endpoint = "/projects/api/v3/tasks/"
let url = "https://" + core.getInput('domain') + endpoint + core.getInput('task_id') + '/complete.json'

// Sends a PUT request to Teamwork to set the task as complete
const putOpts = {
  method: 'PUT',
  headers: {
    'Authorization': `Basic ${core.getInput('api_key')}`,
    'Accept': "application/json",
    'Content-Type': "application/json"
  },
  redirect: 'follow',
  body: 'false'
}

fetch(url, putOpts)
  .then(response => {if (response.status != 204) {throw "Server returned " + response.status}})
  .catch(err => core.setFailed(err.message))
