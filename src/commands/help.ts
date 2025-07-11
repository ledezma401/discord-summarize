import { Message, CommandInteraction, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';

/**
 * Handle the help command
 * @param source Message or CommandInteraction that triggered the command
 */
export async function handleHelpCommand(source: Message | CommandInteraction): Promise<void> {
  try {
    // Create an embed with information about all available commands
    const embed = new EmbedBuilder()
      .setTitle('Discord Summarize Bot - Available Commands')
      .setDescription('Here are all the available commands and how to use them:')
      .setColor('#0099ff')
      .addFields(
        {
          name: '!summarize / !tldr',
          value:
            'Summarizes the last messages in the channel.\n' +
            'Usage: `!summarize [count=50] [model=gemini] [--lang=english|spanish] [custom prompt]`\n' +
            'Example: `!summarize 100 openai --lang=spanish Focus on decisions made`',
          inline: false,
        },
        {
          name: '!summarizeg / !tldrg',
          value:
            'Summarizes the last messages with formatted topics and perspectives.\n' +
            'Usage: `!summarizeg [count=50] [model=gemini] [--lang=english|spanish] [custom prompt]`\n' +
            'Example: `!summarizeg 75 gemini --lang=english Highlight key points`',
          inline: false,
        },
        {
          name: '!help',
          value:
            'Shows this help message with all available commands and how to use them.\n' +
            'Usage: `!help`',
          inline: false,
        },
        {
          name: 'Note',
          value:
            'All commands above have slash command counterparts (e.g., `/summarize`, `/help`).',
          inline: false,
        },
      )
      .setFooter({
        text: 'Discord Summarize Bot',
      })
      .setTimestamp();

    // Reply with the embed
    await reply(source, { embeds: [embed] });
  } catch (error) {
    logger.error('Error in help command:', error);
  }
}

/**
 * Reply to a message or interaction
 * @param source Message or CommandInteraction to reply to
 * @param content Content to send
 * @returns The sent message (for Message) or undefined (for CommandInteraction)
 */
async function reply(
  source: Message | CommandInteraction,
  content: string | { embeds: EmbedBuilder[] },
): Promise<Message | undefined> {
  try {
    if (source instanceof Message) {
      return await source.reply(content);
    } else if (source.deferred || source.replied) {
      await source.editReply(content);
    } else {
      await source.reply(content);
    }
  } catch (error) {
    logger.error('Error replying:', error);
  }
  return undefined;
}
