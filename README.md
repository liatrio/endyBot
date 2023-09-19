[![lint-and-test](https://github.com/liatrio/endyBot/actions/workflows/lint-and-test.yaml/badge.svg)](https://github.com/liatrio/endyBot/actions/workflows/lint-and-test.yaml)
![coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/cfculler/63bc4aeca2dedc9ee2c05ee997adc7fa/raw/coverage.json)
[![codecov](https://codecov.io/gh/liatrio/endyBot/graph/badge.svg?token=jKTuTJwNf1)](https://codecov.io/gh/liatrio/endyBot)

# endyBot
Immortal Hedgehogs Hello DevOps project. endyBot is an EOD post manager that ensures consistent structure, and organizes EOD threads by sending them directly to interested parties.


## How it Works
endyBot creates and manages end of day "groups", where each group is given a name, a list of contirbutors, a list of subscribers, a time at which to post the EOD master thread and notify contributors, and a channel in which to post end of day threads. 

### Notification Time
When a user creates a group, they are prompted to select a notification time. This is the time at which endyBot will notify users in **their timezone as indicated on their Slack profile**.

### Contributors
The contributors list is an array of the Slack IDs of each user who should contribute to an EOD post. They will receive messages from endyBot at their group's notification time. This message will contain a button which, on click, will open a modal that the contributor can fill out with their EOD summary. Once this submission is complete, endyBot will post a copy of the contributor's responses as a reply to that group's EOD thread for the day. If this response is the first one for that group in a day, endyBot will create the new thread, then post the response as a reply.

### Subscribers 
Similarly to contributors, the subscribers list is an array of the Slack IDs of each user that is subscribed to a given group. At 8PM **their timezone**, subscribers will receive a link to the end of day thread for each group they're subscribed to. 

### Running locally
To run endyBot locally, you will need a .env file with the following format:

```
SLACK_CREDS={"SLACK_BOT_TOKEN": "[bot token]", "SLACK_APP_TOKEN": "[app token]"}
DEV=1
ORG=https://liatrio.slack.com/archives/
```

Start the app by running:

```bash
docker compose up
```

### Linting
To lint manually, run: 
```bash
npm install
npx eslint {filename}
```

To use the pre-commit linter hook, run:
```bash
brew install pre-commit
pre-commit install -f
```

The above commands will ensure the pre-commit linter runs automatically when you attempt to make a commit.
Alternatively, you can manually run the linter on _all_ .js files by running:
```bash
pre-commit run --all-files
```