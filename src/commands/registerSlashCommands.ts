import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

/**
 * Define slash commands
 */
const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands and how to use them')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Summarize recent messages in the channel')
    .addIntegerOption((option) =>
      option.setName('count').setDescription('Number of messages to summarize').setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('model')
        .setDescription('AI model to use for summarization')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('prompt')
        .setDescription('Custom prompt to personalize the summary')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('Language for the summary')
        .setRequired(false)
        .addChoices({ name: 'English', value: 'english' }, { name: 'Spanish', value: 'spanish' }),
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('tldr')
    .setDescription('Summarize recent messages in the channel')
    .addIntegerOption((option) =>
      option.setName('count').setDescription('Number of messages to summarize').setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('model')
        .setDescription('AI model to use for summarization')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('prompt')
        .setDescription('Custom prompt to personalize the summary')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('Language for the summary')
        .setRequired(false)
        .addChoices({ name: 'English', value: 'english' }, { name: 'Spanish', value: 'spanish' }),
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('summarizeg')
    .setDescription('Summarize recent messages with formatted topics and perspectives')
    .addIntegerOption((option) =>
      option.setName('count').setDescription('Number of messages to summarize').setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('model')
        .setDescription('AI model to use for summarization')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('prompt')
        .setDescription('Custom prompt to personalize the summary')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('Language for the summary')
        .setRequired(false)
        .addChoices({ name: 'English', value: 'english' }, { name: 'Spanish', value: 'spanish' }),
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('tldrg')
    .setDescription('Summarize recent messages with formatted topics and perspectives')
    .addIntegerOption((option) =>
      option.setName('count').setDescription('Number of messages to summarize').setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('model')
        .setDescription('AI model to use for summarization')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('prompt')
        .setDescription('Custom prompt to personalize the summary')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('Language for the summary')
        .setRequired(false)
        .addChoices({ name: 'English', value: 'english' }, { name: 'Spanish', value: 'spanish' }),
    )
    .toJSON(),
];

/**
 * Register slash commands with Discord API
 */
export async function registerSlashCommands(): Promise<void> {
  try {
    logger.info('Started refreshing application (/) commands.');

    // Create REST instance
    const rest = new REST({ version: '10' }).setToken(config.discordToken);

    // Register commands globally (for all guilds)
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });

    logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error('Error registering slash commands:', error);
  }
}
