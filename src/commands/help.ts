import { Message, CommandInteraction, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';
import { safeReply } from '../utils/discordUtils.js';

/**
 * Handle the help command
 * @param source Message or CommandInteraction that triggered the command
 * @param dm Optional flag to send the help message as a DM instead of replying in the channel
 */
export async function handleHelpCommand(
  source: Message | CommandInteraction,
  dm: boolean = false,
): Promise<void> {
  try {
    // Create an embed with information about all available commands
    const embed = new EmbedBuilder()
      .setTitle('Discord Summarize Bot - Available Commands')
      .setDescription('Here are all the available commands and how to use them:')
      .setColor('#0099ff')
      .addFields(
        {
          name: '!summarize / !tldr / !s',
          value:
            'Summarizes the last messages in the channel.\n' +
            'Usage: `!summarize [count=50] [model=gemini] [--lang=english|spanish] [--dm] [custom prompt]`\n' +
            'Example: `!summarize 100 openai --lang=spanish Focus on decisions made`\n' +
            'Use `--dm` to receive the summary as a direct message instead of in the channel.',
          inline: false,
        },
        {
          name: '!summarizeg / !tldrg / !sg',
          value:
            'Summarizes the last messages with formatted topics and perspectives.\n' +
            'Usage: `!summarizeg [count=50] [model=gemini] [--lang=english|spanish] [--dm] [custom prompt]`\n' +
            'Example: `!summarizeg 75 gemini --lang=english Highlight key points`\n' +
            'Use `--dm` to receive the summary as a direct message instead of in the channel.',
          inline: false,
        },
        {
          name: '!sdm',
          value:
            'Alias for `!summarize` with the `--dm` flag automatically included.\n' +
            'Summarizes the last messages and sends the result as a direct message.\n' +
            'Usage: `!sdm [count=50] [model=gemini] [--lang=english|spanish] [custom prompt]`',
          inline: false,
        },
        {
          name: '!sgdm',
          value:
            'Alias for `!summarizeg` with the `--dm` flag automatically included.\n' +
            'Summarizes the last messages with formatted topics and perspectives and sends the result as a direct message.\n' +
            'Usage: `!sgdm [count=50] [model=gemini] [--lang=english|spanish] [custom prompt]`',
          inline: false,
        },
        {
          name: '!p',
          value:
            'Process a prompt with an AI model.\n' +
            'Usage: `!p [model=gemini] <prompt>`\n' +
            'Example: `!p What is the capital of France?` or `!p openai Explain quantum computing`',
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

    try {
      // Reply with the embed
      await reply(source, { embeds: [embed] }, dm);
    } catch (replyError) {
      logger.error('Error in help command reply:', replyError);
    }
  } catch (error) {
    logger.error('Error in help command:', error);
  }
}

/**
 * Reply to a message or interaction
 * @param source Message or CommandInteraction to reply to
 * @param content Content to send
 * @param dm Whether to send the reply as a DM to the user instead of in the channel
 * @returns The sent message (for Message) or undefined (for CommandInteraction)
 */
async function reply(
  source: Message | CommandInteraction,
  content: string | { embeds: EmbedBuilder[] },
  dm: boolean = false,
): Promise<Message | undefined> {
  // Use the safeReply function from discordUtils to handle character limits
  return await safeReply(source, content, dm);
}
