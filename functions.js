const core = require('@actions/core')
const github = require('@actions/github')
const fetch = require('node-fetch')
const qs = require('qs')

function getKey() {
  return core.getInput('api_key')
}

function getTeamId() {
  return core.getInput('team_id') || 25630900
}

function getUrlWithQueryString(baseUrl, queryString) {
  const queryStringParams = Object.assign({}, queryString)
  return `${baseUrl}/${qs.stringify(queryStringParams)}`
}

async function getRequest(url) {
  // Sends a GET request to Teamwork
  const getOpts = {
    method: 'GET',
    headers: {
      'Authorization': getKey(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    redirect: 'follow'
  }

  let response = await fetch(url, getOpts)
  if (response.status != 200) {
    core.setFailed('Server returned ' + response.status)
    process.exit(1)
  } else {
    return await response.json()
  }
}

async function patchRequest(url, body) {
  // Sends a PATCH request to Teamwork
  const patchOpts = {
    method: 'PATCH',
    headers: {
      'Authorization': getKey(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: body
  }

  let response = await fetch(url, patchOpts)
  if (response.status != 200) {
    core.setFailed('Server returned ' + response.status)
    process.exit(1)
  } else {
    return await response.json();
  }
}

async function putRequest(url, body) {
  // Sends a PUT request to Teamwork
  const putOpts = {
    method: 'PUT',
    headers: {
      'Authorization': getKey(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: body
  }

  let response = await fetch(url, putOpts)
  if (response.status != 200) {
    core.setFailed('Server returned ' + response.status)
    process.exit(1)
  } else {
    return await response.json();
  }
}

async function postRequest(url, body) {
  // Sends a POST request to Teamwork
  const postOpts = {
    method: 'POST',
    headers: {
      'Authorization': getKey(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: body
  }

  let response = await fetch(url, postOpts)
  if (response.status != 200) {
    core.setFailed('Server returned ' + response.status)
    process.exit(1)
  } else {
    return await response.json();
  }
}

module.exports = {getRequest, getTeamId, getUrlWithQueryString, patchRequest, putRequest, postRequest}