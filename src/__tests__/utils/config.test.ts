import { config, validateConfig, getConfig } from '../../utils/config.js';
import { jest, expect, describe, beforeEach, afterEach, it } from '@jest/globals';

describe('config', () => {
  // Store original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { NODE_ENV: 'test' }; // Only keep NODE_ENV for Jest

    // Clear the require cache to ensure config is reloaded with new env vars
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('config object', () => {
    it('should use environment variables when available', () => {
      // Set environment variables
      process.env.DISCORD_TOKEN = 'test-discord-token';
      process.env.CLIENT_ID = 'test-client-id';
      process.env.OPENAI_API_KEY = 'test-openai-key';
      process.env.OPENAI_MODEL = 'test-model';

      // Get a fresh config with the updated environment variables
      const currentConfig = getConfig();

      // Check that config uses the environment variables
      expect(currentConfig.discordToken).toBe('test-discord-token');
      expect(currentConfig.clientId).toBe('test-client-id');
      expect(currentConfig.openaiApiKey).toBe('test-openai-key');
      expect(currentConfig.openaiModel).toBe('test-model');
    });

    it('should use default values when environment variables are not set', () => {
      // Clear environment variables
      delete process.env.DISCORD_TOKEN;
      delete process.env.CLIENT_ID;
      delete process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_MODEL;

      // Get a fresh config with the updated environment variables
      const currentConfig = getConfig();

      // Check that config uses default values
      expect(currentConfig.discordToken).toBe('');
      expect(currentConfig.clientId).toBe('');
      expect(currentConfig.openaiApiKey).toBe('');
      expect(currentConfig.openaiModel).toBe('gpt-4-turbo');
      expect(currentConfig.defaultMessageCount).toBe(50);
    });
  });

  describe('validateConfig', () => {
    it('should not throw an error when all required environment variables are set', () => {
      // Set all required environment variables
      process.env.DISCORD_TOKEN = 'test-discord-token';
      process.env.CLIENT_ID = 'test-client-id';
      process.env.OPENAI_API_KEY = 'test-openai-key';

      // Should not throw an error
      expect(() => validateConfig()).not.toThrow();
    });

    it('should throw an error when DISCORD_TOKEN is not set', () => {
      // Set all required environment variables except DISCORD_TOKEN
      delete process.env.DISCORD_TOKEN;
      process.env.CLIENT_ID = 'test-client-id';
      process.env.OPENAI_API_KEY = 'test-openai-key';

      // Should throw an error about DISCORD_TOKEN
      expect(() => validateConfig()).toThrow('DISCORD_TOKEN environment variable is not set');
    });

    it('should throw an error when CLIENT_ID is not set', () => {
      // Set all required environment variables except CLIENT_ID
      process.env.DISCORD_TOKEN = 'test-discord-token';
      delete process.env.CLIENT_ID;
      process.env.OPENAI_API_KEY = 'test-openai-key';

      // Should throw an error about CLIENT_ID
      expect(() => validateConfig()).toThrow('CLIENT_ID environment variable is not set');
    });

    it('should throw an error when OPENAI_API_KEY is not set', () => {
      // Set all required environment variables except OPENAI_API_KEY
      process.env.DISCORD_TOKEN = 'test-discord-token';
      process.env.CLIENT_ID = 'test-client-id';
      delete process.env.OPENAI_API_KEY;

      // Should throw an error about OPENAI_API_KEY
      expect(() => validateConfig()).toThrow('OPENAI_API_KEY environment variable is not set');
    });
  });
});
