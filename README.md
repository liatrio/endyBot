# endyBot
Immortal Hedgehogs Hello DevOps project. endyBot is an EOD post manager that ensures consistent structure, and organizes EOD threads by sending them directly to interested parties.

### Running locally
To run endyBot locally, you will need a .env file with the following format:

```
SLACK_BOT_TOKEN={Bot token}
SLACK_APP_TOKEN={App token}
```

Start the app by running:

```bash
npm start
```

or 

```bash
docker compose up
```

to run with Docker.