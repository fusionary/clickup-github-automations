const core = require('@actions/core');
const fetch = require('node-fetch');
const github = require('@actions/github');

const endpoint = "/projects/api/v3/tasks/"
let url = "https://" + core.getInput('domain') + endpoint + core.getInput('task_id') + '/complete.json';

// Send GET request to get the current contents of the notebook
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
  .then(response => console.log(response))
  .catch(err => console.error(err));