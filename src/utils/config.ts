import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration object for the application
 */
export const config = {
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

/**
 * Validate the configuration
 * @throws Error if any required configuration is missing
 */
export function validateConfig(): void {
  if (!config.discordToken) {
    throw new Error('DISCORD_TOKEN environment variable is not set');
  }

  if (!config.clientId) {
    throw new Error('CLIENT_ID environment variable is not set');
  }

  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
}
