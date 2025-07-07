import { Client, GatewayIntentBits, Events } from 'discord.js';
import { config, validateConfig } from './utils/config';
import { registerCommands } from './commands';
import { registerSlashCommands } from './commands/registerSlashCommands';

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
  console.log(`Logged in as ${readyClient.user.tag}`);

  // Register slash commands
  await registerSlashCommands();
});

// Register commands
registerCommands(client);

// Login to Discord
client.login(config.discordToken).catch((error) => {
  console.error('Error logging in to Discord:', error);
  process.exit(1);
});
