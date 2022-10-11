const {getRequest, postRequest} = require('../../functions.js')
const core = require('@actions/core')
require('dotenv').config()

describe('test REST request', function () {

  it('gets task', async function() {
    spyOn(core, 'getInput').and.returnValue(process.env.CLICKUP_API_KEY)
    spyOn(console, 'log').and.callThrough()

    let task = await getRequest('https://api.clickup.com/api/v2/task/2q3c5gk')
    expect(task.name).toBe('Test task')
    expect(task.date_created).toBe('1659187664187')
  })

  it('moves a task to the "In Progress" column', async function () {
    spyOn(core, 'getInput').and.returnValue(process.env.CLICKUP_API_KEY)
    spyOn(console, 'log').and.callThrough()

    let res = await postRequest('https://test.clickup.com/api/v2/task/2q3c5gk/field/406487e2-4f0d-4ea7-a50a-2b1cb25cb2c2', '{"value": "ccf86cb1-0544-4690-acb9-07ac29ed9780"}')
    expect(res.status).not.toThrowError

    let task = await getRequest('https://api.clickup.com/api/v2/task/2q3c5gk')
    expect(task.custom_fields.find(field => field.name == 'Dev Phases').value).toBe(2)
  })

  it('moves a task to the "To Do" column', async function () {
    spyOn(core, 'getInput').and.returnValue(process.env.CLICKUP_API_KEY)
    spyOn(console, 'log').and.callThrough()

    let res = await postRequest('https://test.clickup.com/api/v2/task/2q3c5gk/field/406487e2-4f0d-4ea7-a50a-2b1cb25cb2c2', '{"value": "1bedec11-e96a-4d85-a7d9-d2dd4bb537df"}')
    expect(res.status).not.toThrowError

    let task = await getRequest('https://api.clickup.com/api/v2/task/2q3c5gk')
    expect(task.custom_fields.find(field => field.name == 'Dev Phases').value).toBe(0)
  })

  // it('adds the "code review" tag to the task', async function () {
  //   spyOn(core, 'getInput').and.returnValue(process.env.CLICKUP_API_KEY)
  //   spyOn(console, 'log').and.callThrough()

  //   await putRequest('https://app.clickup.com/projects/api/v3/tasks/26801523/tags.json', '{"replaceExistingTags": true, "tagIds": [176922]}')

  //   let tags = await getRequest('https://app.clickup.com/tasks/26801523/tags.json')
  //   expect(tags.tags.find((tag => tag.id == 176922)).id).toBe('176922')
  // })
})