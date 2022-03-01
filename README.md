# PRs Close Teamwork Tasks

An Action to mark a Teamwork task as complete when its PR is merged

## Inputs

## `task_id`

**Required** The ID of the task to mark as complete in Teamwork

## `domain`

**Required** The domain of your Teamwork site. Follows the format <company>.teamwork.com for US sites, or <company>.eu.teamwork.com for EU sites

## `api_key`

**Required** Your Teamwork API key

## Example usage

```
jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: Aetheron/pr-close-teamwork-task@main
      with:
        task_id: 1234567
        domain: company.teamwork.com
        api_key: ${{ secrets.TEAMWORK_API_KEY }}
```
