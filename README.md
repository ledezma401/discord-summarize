# Discord Summarize

A Discord bot that summarizes chat conversations using AI models.

## Features

* `!summarize <count=50> <model=openAI>` - Summarizes the last `count` messages using the specified AI model.
* `/summarize <count=50> <model=openAI>` - Slash command version of the summarize command.
* `!tldr <count=50> <model=openAI>` - Alternative command that does the same as `!summarize`.
* `/tldr <count=50> <model=openAI>` - Alternative slash command that does the same as `/summarize`.
* `!summarizeg <count=50> <model=openAI>` - Summarizes the last `count` messages with formatted topics and user perspectives.
* `/summarizeg <count=50> <model=openAI>` - Slash command version of the summarizeg command.
* `!tldrg <count=50> <model=openAI>` - Alternative command that does the same as `!summarizeg`.
* `/tldrg <count=50> <model=openAI>` - Alternative slash command that does the same as `/summarizeg`.

## Installation on a Discord Server

1. **Create a Discord Application**
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" and give it a name
   - Go to the "Bot" tab and click "Add Bot"
   - Under the "Privileged Gateway Intents" section, enable:
     - Message Content Intent
     - Server Members Intent
     - Presence Intent

2. **Get Your Bot Token**
   - In the Bot tab, click "Reset Token" and copy your token
   - Keep this token secure and don't share it publicly

3. **Invite the Bot to Your Server**
   - Go to the "OAuth2" tab, then "URL Generator"
   - Select the following scopes:
     - `bot`
     - `applications.commands`
   - Select the following bot permissions:
     - Read Messages/View Channels
     - Send Messages
     - Read Message History
   - Copy the generated URL and open it in your browser
   - Select your server and authorize the bot

4. **Set Up the Bot**
   - Clone this repository
   - Create a `.env` file in the root directory with the following content:
     ```
     DISCORD_TOKEN=your_discord_bot_token_here
     CLIENT_ID=your_discord_client_id_here
     OPENAI_API_KEY=your_openai_api_key_here
     OPENAI_MODEL=gpt-4-turbo
     ```
   - Replace `your_discord_bot_token_here` with your Discord bot token
   - Replace `your_discord_client_id_here` with your Discord application ID
   - Replace `your_openai_api_key_here` with your OpenAI API key

5. **Run the Bot**
   - Install dependencies: `npm install`
   - Build the bot: `npm run build`
   - Start the bot: `npm start`

## Usage

Once the bot is running and added to your server, you can use the following commands:

- **Standard Summary Commands**: 
  - Type `!summarize` in any channel to summarize the last 50 messages.
  - Type `!tldr` in any channel to do the same thing (alternative command).
  - Optional parameters:
    - `!summarize 100` or `!tldr 100` - Summarize the last 100 messages
    - `!summarize 30 openai` or `!tldr 30 openai` - Summarize the last 30 messages using the OpenAI model

- **Formatted Summary Commands**:
  - Type `!summarizeg` in any channel to get a formatted summary with topics and user perspectives.
  - Type `!tldrg` in any channel to do the same thing (alternative command).
  - These commands produce a nicely formatted output with:
    - A short summary of the main topics discussed
    - Each person's perspective on those topics
    - Formatting with bold text, emojis, and separators for readability
  - Optional parameters work the same as standard commands:
    - `!summarizeg 100` or `!tldrg 100` - Summarize the last 100 messages
    - `!summarizeg 30 openai` or `!tldrg 30 openai` - Summarize the last 30 messages using the OpenAI model

- **Slash Commands**: 
  - Standard summary: Type `/summarize` or `/tldr` and use the interactive options.
  - Formatted summary: Type `/summarizeg` or `/tldrg` and use the interactive options.
  - Optional parameters for all slash commands:
    - `count` - Number of messages to summarize (default: 50)
    - `model` - AI model to use (default: openai)

## Local Development

For instructions on setting up the bot for local development, see [local-installation.md](local-installation.md).

## License

This project is licensed under the ISC License - see the LICENSE file for details.
