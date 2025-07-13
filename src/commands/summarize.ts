import { Message, CommandInteraction, TextChannel, EmbedBuilder, Collection } from 'discord.js';
import { ModelFactory } from '../models/ModelFactory.js';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { safeReply, createMultipleEmbeds } from '../utils/discordUtils.js';

/**
 * Handle the summarize command
 * @param source Message or CommandInteraction that triggered the command
 * @param count Optional number of messages to summarize
 * @param modelName Optional name of the model to use
 * @param customPrompt Optional custom prompt to personalize the summary
 * @param language Optional language for the summary (default: 'english', options: 'english', 'spanish')
 * @param dm Optional flag to send the summary as a DM instead of replying in the channel
 */
export async function handleSummarizeCommand(
  source: Message | CommandInteraction,
  count?: number | null,
  modelName?: string | null,
  customPrompt?: string | null,
  language: string = 'english',
  dm: boolean = false,
): Promise<void> {
  try {
    // Determine the channel
    const channel = source instanceof Message ? source.channel : source.channel;
    if (!channel || !('messages' in channel)) {
      await reply(source, 'Cannot access messages in this channel.', dm);
      return;
    }

    // Parse command arguments
    const messageCount = count || config.defaultMessageCount;

    // Validate count parameter
    if (messageCount < 1 || messageCount > 500) {
      await reply(source, 'Error: Count must be between 1 and 500.', dm);
      return;
    }

    const model = modelName || 'gemini';

    // Fetch messages
    const messages = await fetchMessages(channel as TextChannel, messageCount);

    if (messages.size === 0) {
      await reply(source, 'No messages found to summarize.', dm);
      return;
    }

    // Format messages for summarization
    const formattedMessages = formatMessages(messages);

    // Get the AI model
    try {
      const aiModel = ModelFactory.createModel(model);

      // Show typing indicator if the channel supports it
      if (source instanceof Message && source.channel && 'sendTyping' in source.channel) {
        let sendtypeRes = await source.channel.sendTyping();

        logger.debug('Send typing result:', sendtypeRes);
      }

      // Generate summary
      const summary = await aiModel.summarize(
        formattedMessages,
        false,
        undefined,
        customPrompt || undefined,
        language,
      );

      // Create embeds with summary, splitting if necessary
      const footerText = `Summarized ${messages.size} messages using ${aiModel.getName()} and !summarize command.`;
      const embeds = createMultipleEmbeds('Chat Summary', summary, '#0099ff', { text: footerText });

      await reply(source, { embeds }, dm);
    } catch (error) {
      await reply(
        source,
        `Error: ${(error as Error).message}. Available models: ${ModelFactory.getAvailableModels().join(
          ', ',
        )}`,
        dm,
      );
    }
  } catch (error) {
    logger.error('Error in summarize command:', error);
    await reply(source, `An error occurred: ${(error as Error).message}`, dm);
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
    // Discord API can only fetch up to 100 messages at a time
    // If count > 100, we need to fetch in batches
    const allMessages = new Collection<string, Message>();
    let lastId: string | undefined = undefined;
    let remaining = count;

    while (remaining > 0) {
      const options: { limit: number; before?: string } = {
        limit: Math.min(remaining, 100),
      };

      if (lastId) {
        options.before = lastId;
      }

      const messages = await channel.messages.fetch(options);

      if (messages.size === 0) {
        break; // No more messages to fetch
      }

      // Add fetched messages to our collection
      messages.forEach((message) => {
        allMessages.set(message.id, message);
      });

      // Update for next iteration
      lastId = messages.last()?.id;
      remaining -= messages.size;
    }

    return allMessages;
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
