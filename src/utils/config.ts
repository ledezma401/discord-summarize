import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Get the configuration object for the application
 * This function allows reloading the config with updated environment variables
 * @returns The configuration object
 */
export function getConfig(): {
  discordToken: string;
  clientId: string;
  openaiApiKey: string;
  openaiModel: string;
  defaultMessageCount: number;
} {
  return {
    /**
     * Discord bot token
     */
    discordToken: process.env.DISCORD_TOKEN || '',

    /**
     * Discord client ID (application ID)
     */
    clientId: process.env.CLIENT_ID || '',

    /**
     * OpenAI API key
     */
    openaiApiKey: process.env.OPENAI_API_KEY || '',

    /**
     * OpenAI model to use
     */
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4-turbo',

    /**
     * Default number of messages to summarize
     */
    defaultMessageCount: 50,
  };
}

/**
 * Configuration object for the application
 */
export const config = getConfig();

/**
 * Validate the configuration
 * @throws Error if any required configuration is missing
 */
export function validateConfig(): void {
  const currentConfig = getConfig();

  if (!currentConfig.discordToken) {
    throw new Error('DISCORD_TOKEN environment variable is not set');
  }

  if (!currentConfig.clientId) {
    throw new Error('CLIENT_ID environment variable is not set');
  }

  if (!currentConfig.openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
}
