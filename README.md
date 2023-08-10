[![lint-and-test](https://github.com/liatrio/endyBot/actions/workflows/lint-and-test.yaml/badge.svg)](https://github.com/liatrio/endyBot/actions/workflows/lint-and-test.yaml)
![coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/cfculler/63bc4aeca2dedc9ee2c05ee997adc7fa/raw/coverage.json)

# endyBot
Immortal Hedgehogs Hello DevOps project. endyBot is an EOD post manager that ensures consistent structure, and organizes EOD threads by sending them directly to interested parties.

### Running locally
To run endyBot locally, you will need a .env file with the following format:

```
SLACK_CREDS={"SLACK_BOT_TOKEN": "[bot token]", "SLACK_APP_TOKEN": "[app token]"}
DEV=1
```

Start the app by running:

```bash
docker compose up
```

to run with Docker.

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