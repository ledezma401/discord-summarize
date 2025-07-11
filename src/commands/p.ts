import { Message, CommandInteraction, EmbedBuilder } from 'discord.js';
import { ModelFactory } from '../models/ModelFactory.js';
import { logger } from '../utils/logger.js';
import { validatePrompt } from '../utils/promptValidator.js';

/**
 * Handle the p command
 * @param source Message or CommandInteraction that triggered the command
 * @param prompt The prompt to process
 * @param modelName Optional name of the model to use
 */
export async function handlePCommand(
  source: Message | CommandInteraction,
  prompt: string,
  modelName?: string | null,
): Promise<void> {
  try {
    if (!prompt || prompt.trim() === '') {
      await reply(source, 'Error: Please provide a prompt.');
      return;
    }

    // Validate the prompt for safety
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      await reply(source, `Error: ${validation.error}`);
      return;
    }

    const model = modelName || 'gemini';

    // Get the AI model
    try {
      const aiModel = ModelFactory.createModel(model);

      // Show typing indicator if the channel supports it
      if (source instanceof Message && source.channel && 'sendTyping' in source.channel) {
        await source.channel.sendTyping();
      }

      // Process the prompt
      const response = await aiModel.processPrompt(prompt);

      // Create and send embed with response
      const embed = new EmbedBuilder()
        .setTitle('🤖 AI Response')
        .setDescription(response)
        .setColor('#0099ff')
        .setFooter({
          text: `Processed using ${aiModel.getName()}`,
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
    logger.error('Error in p command:', error);
    await reply(source, `An error occurred: ${(error as Error).message}`);
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
      return undefined;
    } else {
      await source.reply(content);
    }
  } catch (error) {
    logger.error('Error replying:', error);
  }
  return undefined;
}
