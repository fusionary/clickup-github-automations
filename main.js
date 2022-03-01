const core = require('@actions/core');
const fetch = require('node-fetch');
const github = require('@actions/github');

const endpoint = "/projects/api/v3/tasks/"
let url = "https://" + core.getInput('domain') + endpoint + core.getInput('task_id') + '/complete.json';

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
};

fetch(url, putOpts)
  .then(response => {if (response.status != 204) {throw "Server returned " + response.status}})
  .catch(err => core.setFailed(err.message));