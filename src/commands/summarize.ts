import { Message, CommandInteraction, TextChannel, EmbedBuilder, Collection } from 'discord.js';
import { ModelFactory } from '../models/ModelFactory.js';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

/**
 * Handle the summarize command
 * @param source Message or CommandInteraction that triggered the command
 * @param count Optional number of messages to summarize
 * @param modelName Optional name of the model to use
 * @param customPrompt Optional custom prompt to personalize the summary
 * @param language Optional language for the summary (default: 'english', options: 'english', 'spanish')
 */
export async function handleSummarizeCommand(
  source: Message | CommandInteraction,
  count?: number | null,
  modelName?: string | null,
  customPrompt?: string | null,
  language: string = 'english',
): Promise<void> {
  try {
    // Determine the channel
    const channel = source instanceof Message ? source.channel : source.channel;
    if (!channel || !('messages' in channel)) {
      await reply(source, 'Cannot access messages in this channel.');
      return;
    }

    // Parse command arguments
    const messageCount = count || config.defaultMessageCount;

    // Validate count parameter
    if (messageCount < 1 || messageCount > 500) {
      await reply(source, 'Error: Count must be between 1 and 500.');
      return;
    }

    const model = modelName || 'openai';

    // Fetch messages
    const messages = await fetchMessages(channel as TextChannel, messageCount);

    if (messages.size === 0) {
      await reply(source, 'No messages found to summarize.');
      return;
    }

    // Format messages for summarization
    const formattedMessages = formatMessages(messages);

    // Get the AI model
    try {
      const aiModel = ModelFactory.createModel(model);

      // Generate summary
      const summary = await aiModel.summarize(
        formattedMessages,
        false,
        undefined,
        customPrompt || undefined,
        language,
      );

      // Create and send embed with summary
      const embed = new EmbedBuilder()
        .setTitle('Chat Summary')
        .setDescription(summary)
        .setColor('#0099ff')
        .setFooter({
          text: `Summarized ${messages.size} messages using ${aiModel.getName()}`,
        })
        .setTimestamp();

      await reply(source, { embeds: [embed] });
    } catch (error) {
      await reply(
        source,
        `Error: ${(error as Error).message}. Available models: ${ModelFactory.getAvailableModels().join(
          ', ',
        )}`,
      );
    }
  } catch (error) {
    logger.error('Error in summarize command:', error);
    await reply(source, `An error occurred: ${(error as Error).message}`);
  }
}

/**
 * Fetch messages from a channel
 * @param channel Channel to fetch messages from
 * @param count Number of messages to fetch
 * @returns Array of messages
 */
async function fetchMessages(
  channel: TextChannel,
  count: number,
): Promise<Collection<string, Message>> {
  try {
    const messages = await channel.messages.fetch({ limit: count });
    return messages;
  } catch (error) {
    logger.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages from the channel.');
  }
}

/**
 * Format messages for summarization
 * @param messages Collection of messages
 * @returns Array of formatted message strings
 */
function formatMessages(messages: Collection<string, Message>): string[] {
  return messages
    .map((msg) => {
      // Skip messages with no content
      if (!msg.content) return null;

      // Format as "Username: Message content"
      return `${msg.author.username}: ${msg.content}`;
    })
    .filter((msg): msg is string => msg !== null)
    .reverse(); // Oldest first
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
