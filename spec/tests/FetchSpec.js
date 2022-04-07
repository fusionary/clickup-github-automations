const {getRequest} = require('../../functions.js')
const core = require('@actions/core')
require('dotenv').config()

describe('test REST request', function () {

  it('sends a GET request to teamwork', async function() {
    spyOn(core, 'getInput').and.returnValue(process.env.TW_KEY)
    spyOn(console, 'log').and.callThrough()

    let tag = await getRequest('https://fusionary.teamwork.com/projects/api/v3/tags.json?projectIds=0&searchTerm=estimate')
    
    expect(tag.tags[0].id).toBe(81729)
  })
})