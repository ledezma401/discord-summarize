import { Client, Events, ChatInputCommandInteraction } from 'discord.js';
import { handleSummarizeCommand } from './summarize.js';
import { handleSummarizeGCommand } from './summarizeg.js';

/**
 * Register all commands with the Discord client
 * @param client Discord client
 */
export function registerCommands(client: Client): void {
  // Handle message commands (e.g., !summarize, !tldr, !summarizeg, !tldrg)
  client.on(Events.MessageCreate, async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Parse command arguments
    const args = message.content.split(' ').slice(1);
    let count = null;
    let model = null;

    // Parse the count parameter (first argument)
    if (args.length > 0) {
      const countArg = parseInt(args[0]);
      if (!isNaN(countArg)) {
        count = countArg;
      }
    }

    // Parse the model parameter (second argument)
    if (args.length > 1) {
      model = args[1];
    }

    // Check if the message starts with !summarize or !tldr
    if (message.content.startsWith('!summarize') || message.content.startsWith('!tldr')) {
      await handleSummarizeCommand(message, count, model);
    }
    // Check if the message starts with !summarizeg or !tldrg
    else if (message.content.startsWith('!summarizeg') || message.content.startsWith('!tldrg')) {
      await handleSummarizeGCommand(message, count, model);
    }
  });

  // Handle slash commands (e.g., /summarize, /tldr, /summarizeg, /tldrg)
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // Now TypeScript knows this is a ChatInputCommandInteraction
    const commandInteraction = interaction as ChatInputCommandInteraction;
    const commandName = commandInteraction.commandName;

    // Check if this is one of our commands
    if (['summarize', 'tldr', 'summarizeg', 'tldrg'].includes(commandName)) {
      await commandInteraction.deferReply();
      try {
        const count = commandInteraction.options.getInteger('count');
        const model = commandInteraction.options.getString('model');

        // Get the channel where the command was used
        const channel = commandInteraction.channel;
        if (!channel) {
          await commandInteraction.editReply('Cannot access the channel.');
          return;
        }

        // Call the appropriate handler based on the command
        if (commandName === 'summarize' || commandName === 'tldr') {
          await handleSummarizeCommand(commandInteraction, count, model);
        } else if (commandName === 'summarizeg' || commandName === 'tldrg') {
          await handleSummarizeGCommand(commandInteraction, count, model);
        }
      } catch (error) {
        console.error('Error handling slash command:', error);
        await commandInteraction.editReply('An error occurred while processing the command.');
      }
    }
  });
}
