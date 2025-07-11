# Discord Summarize App

This app aims to offer quick and performant summarization of discord chats.


## Features
* `!summarize <count=50> <model=gemini>` / `/summarize <count=50> <model=openAI>` summarizes the last `count` chats using a variety of AI models (default gemini).
* `!summarizeg <count=50> <model=gemini>` / `/summarizeg <count=50> <model=openAI>` summarizes the last `count` chats using a variety of AI models (default gemini).
* `!tldr` Alias of !summarize
* `!tldrg` Alias of !summarizeg
* `!help` shows help of available commands and their signatures

## General Technical Design
* Must use the latest typescript and node v20.14.0
* Must be linted for code cleanliness.
* Must be linted on commit, to ensure all changes reach github properly formatted.
* Must have a github workflow that lints and tests the app to ensure PRs are in good shape before merging.
* Must include tests and tests must be constantly updated with a min of 75% coverage.
* Documentation must be updated every time to ensure completion.
* Main README.md must exist with step by step instructions on how to install on a discord server.
* Additional local-installation.md must include very brief and step by step instructions to successfully set up the app locally and test it.
* When creating a new command, always create a slash command counterpart.
* When creating new commands always add them to !help

## Coding Guidelines
* Must be modular enough for scalability.
* Must be able to use different AI models based on configuration or input parameters.
* Must be able to use local LLM models as a possiblity. 
* Consider using strategy a pattern to seamlessly switch between models and keep a coherent interface.
* Respect rules of `eslint.config.js`
* Respect rules of `.prettierrc`
* Respect rules of `tsconfig.json`

## Testing & QC
* All Tests must PASS `npm run test`
* Build must be error free `npm run build`
* Min Coverage must be respected, fix until achieved.
* All lints must pass `npm run lint`
