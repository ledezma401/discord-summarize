import { Client, GatewayIntentBits, Events } from 'discord.js';
import { config, validateConfig } from './utils/config.js';
import { registerCommands } from './commands/index.js';
import { registerSlashCommands } from './commands/registerSlashCommands.js';
import { logger } from './utils/logger.js';

// Validate configuration
validateConfig();

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Register event handlers
client.once(Events.ClientReady, async (readyClient) => {
  logger.info(`Logged in as ${readyClient.user.tag}`);

  // Register slash commands
  await registerSlashCommands();
});

// Register commands
registerCommands(client);

// Login to Discord
client.login(config.discordToken).catch((error) => {
  logger.error('Error logging in to Discord:', error);
  process.exit(1);
});
