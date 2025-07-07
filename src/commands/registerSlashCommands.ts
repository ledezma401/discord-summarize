import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from '../utils/config.js';

/**
 * Define slash commands
 */
const commands = [
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
    .toJSON(),
];

/**
 * Register slash commands with Discord API
 */
export async function registerSlashCommands(): Promise<void> {
  try {
    console.log('Started refreshing application (/) commands.');

    // Create REST instance
    const rest = new REST({ version: '10' }).setToken(config.discordToken);

    // Register commands globally (for all guilds)
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
}
