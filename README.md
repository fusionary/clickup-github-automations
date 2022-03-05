# PRs Close Teamwork Tasks

An Action to mark a Teamwork task as complete when its PR is merged

## Inputs

## `task_id`

**Optional** The ID of the task to mark as complete in Teamwork. If unset, the first line of the PR description will be parsed for a task ID

## `domain`

**Required** The domain of your Teamwork site. Follows the format <company>.teamwork.com for US sites, or <company>.eu.teamwork.com for EU sites

## `api_key`

**Required** Your Teamwork API key

## Example usage

```
on:
  pull_request:
    types: [closed]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: Aetheron/pr-close-teamwork-task@main
      with:
        domain: company.teamwork.com
        api_key: ${{ secrets.TEAMWORK_API_KEY }}
```
