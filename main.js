const core = require('@actions/core')
const github = require('@actions/github')
const { GitHub } = require('@actions/github/lib/utils')
const {getRequest, getTaskIdsFromBody, getTeamId, getUrlWithQueryString, postRequest} = require('./functions.js')

let taskIDs = []
if (!core.getInput('task_id')) {
  // No task override. Look for task id in PR description
  const prBody = github.context.payload.pull_request?.body
  if (prBody) {
    taskIDs = getTaskIdsFromBody(prBody);

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
  // Sends a GET request to ClickUp to retrieve info about the task
  const taskEndpoint = 'api/v2/task'
  let taskUrl = `https://api.clickup.com/${taskEndpoint}/${taskID}`
  const queryString = taskID.includes('-') ? {
    custom_task_ids: true,
    team_id: getTeamId(),
  } : {}

  getRequest(getUrlWithQueryString(taskUrl, queryString))
    .then(async task => {
      // Task data contains options for custom field "Dev Phase"
      const devPhaseField = task.custom_fields.find(
        field => field.name == 'Dev Phases' && field.type == 'drop_down'
      )

      const taskCustomFieldUrl = `${taskUrl}/field/${devPhaseField.id}`
      
      switch (github.context.payload.action) {
        case 'opened':
          core.info('PR Opened')

          // Get the "Code Review" dev phase
          const codeReview = devPhaseField.type_config.options.find(
            option => option.name == 'Code Review'
          )

          // Sends a POST request to ClickUp to set the task dev phase to "code review"
          await postRequest(taskCustomFieldUrl, `{"value": "${codeReview.id}"}`)
          
          const commentUrl = `${taskUrl}/comment`
          await postRequest(geturlWithQueryString(commentUrl, queryString), JSON.stringify({
            "comment": [
                {
                    "text": "This task is ready for code review\n",
                    "attributes": {}
                },
                {
                    "text": github.context.payload.pull_request.html_url,
                    "attributes": {
                        "link": github.context.payload.pull_request.html_url
                    }
                }
            ],
            "notify_all": false
          }))

          break;

        case 'closed':
          core.info('PR Closed')  
        
          // Get the "QA" dev phase
          const qa = devPhaseField.type_config.options.find(
            option => option.name == 'QA'
          )

          // Sends a POST request to ClickUp to set the task dev phase to "QA"
          await postRequest(getUrlWithQueryString(taskCustomFieldUrl, queryString), `{"value": "${qa.id}"}`)

          break;

        default:
          core.info('Unrecognized action ' + github.context.action)  
        
          break;
      }

    core.info('Successfully updated task ' + taskID)
    })
})
