const {getTaskIdsFromBody} = require('../../functions.js')

describe('test body parsing', function () {
    const bodyParameters = [
        'https://app.clickup.com/t/25630900/CLIENTS-8124',
        'https://fusionary.clickup.com/t/25630900/CLIENTS-8124'
    ];

    bodyParameters.forEach((param) => {
        it('test body', () => {
            const result = getTaskIdsFromBody(param)
            expect(result).toBeDefined()
        })
    })
})