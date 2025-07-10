import { Client, Events, ChatInputCommandInteraction } from 'discord.js';
import { handleSummarizeCommand } from './summarize.js';
import { handleSummarizeGCommand } from './summarizeg.js';
import { logger } from '../utils/logger.js';

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
    let customPrompt = null;
    let language = 'english'; // Default language

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

    // Parse the language parameter (look for --lang=english or --lang=spanish)
    const langArg = args.find(arg => arg.startsWith('--lang='));
    if (langArg) {
      const langValue = langArg.split('=')[1]?.toLowerCase();
      if (langValue === 'spanish' || langValue === 'english') {
        language = langValue;
      }
    }

    // Parse the custom prompt (anything after the model and not starting with --)
    const promptArgs = args.slice(Math.max(1, args.findIndex(arg => !arg.startsWith('--') && arg !== model && isNaN(parseInt(arg)))));
    if (promptArgs.length > 0) {
      customPrompt = promptArgs.join(' ');
    }

    // Check if the message starts with !summarize or !tldr
    if (message.content.startsWith('!summarize') || message.content.startsWith('!tldr')) {
      await handleSummarizeCommand(message, count, model, customPrompt, language);
    }
    // Check if the message starts with !summarizeg or !tldrg
    else if (message.content.startsWith('!summarizeg') || message.content.startsWith('!tldrg')) {
      await handleSummarizeGCommand(message, count, model, customPrompt, language);
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
        const customPrompt = commandInteraction.options.getString('prompt');
        const language = commandInteraction.options.getString('language') || 'english';

        // Get the channel where the command was used
        const channel = commandInteraction.channel;
        if (!channel) {
          await commandInteraction.editReply('Cannot access the channel.');
          return;
        }

        // Call the appropriate handler based on the command
        if (commandName === 'summarize' || commandName === 'tldr') {
          await handleSummarizeCommand(commandInteraction, count, model, customPrompt, language);
        } else if (commandName === 'summarizeg' || commandName === 'tldrg') {
          await handleSummarizeGCommand(commandInteraction, count, model, customPrompt, language);
        }
      } catch (error) {
        logger.error('Error handling slash command:', error);
        await commandInteraction.editReply('An error occurred while processing the command.');
      }
    }
  });
}
