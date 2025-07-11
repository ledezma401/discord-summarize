import { Logger, LogLevel, logger } from '../../utils/logger.js';
import { jest, expect, describe, beforeEach, afterEach, it } from '@jest/globals';

describe('Logger', () => {
  // Store original console methods and environment
  const originalConsole = { ...console };
  const originalEnv = process.env;

  // Mock console methods
  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };

    // Mock console methods
    console.debug = jest.fn();
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.debug = originalConsole.debug;
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;

    // Restore original environment
    process.env = originalEnv;

    // Reset modules to ensure Logger singleton is recreated
    jest.resetModules();
  });

  describe('Singleton pattern', () => {
    it('should return the same instance when getInstance is called multiple times', async () => {
      // Import the Logger class
      const { Logger } = await import('../../utils/logger.js');

      // Get two instances
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();

      // They should be the same object
      expect(instance1).toBe(instance2);
    });

    it('should export a default logger instance', async () => {
      // Import both Logger and logger
      const { Logger, logger } = await import('../../utils/logger.js');

      // logger should be an instance of Logger
      expect(logger).toBeInstanceOf(Logger);
    });
  });

  describe('Log level', () => {
    it('should use INFO as default log level', async () => {
      // Get a new instance with default settings
      const { logger } = await import('../../utils/logger.js');

      // Test logging at different levels
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      // DEBUG should not be logged (default is INFO)
      expect(console.debug).not.toHaveBeenCalled();

      // INFO and above should be logged
      expect(console.log).toHaveBeenCalledWith('[INFO] Info message');
      expect(console.warn).toHaveBeenCalledWith('[WARN] Warning message');
      expect(console.error).toHaveBeenCalledWith('[ERROR] Error message');
    });

    it('should use log level from environment variable if available', async () => {
      // Set environment log level to DEBUG
      process.env.LOG_LEVEL = 'DEBUG';

      // Get a new instance with environment settings
      const { logger } = await import('../../utils/logger.js');

      // Test logging at different levels
      logger.debug('Debug message');
      logger.info('Info message');

      // Both DEBUG and INFO should be logged
      expect(console.debug).toHaveBeenCalledWith('[DEBUG] Debug message');
      expect(console.log).toHaveBeenCalledWith('[INFO] Info message');
    });

    it('should ignore invalid log level from environment', async () => {
      // Set invalid environment log level
      process.env.LOG_LEVEL = 'INVALID_LEVEL';

      // Get a new instance with environment settings
      const { logger } = await import('../../utils/logger.js');

      // Test logging at different levels
      logger.debug('Debug message');
      logger.info('Info message');

      // DEBUG should not be logged (default is INFO)
      expect(console.debug).not.toHaveBeenCalled();

      // INFO should be logged
      expect(console.log).toHaveBeenCalledWith('[INFO] Info message');
    });

    it('should allow changing log level after initialization', async () => {
      // Get a new instance with default settings
      const { logger, LogLevel } = await import('../../utils/logger.js');

      // Change log level to ERROR
      logger.setLogLevel(LogLevel.ERROR);

      // Test logging at different levels
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      // Only ERROR should be logged
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('[ERROR] Error message');
    });
  });

  describe('Logging methods', () => {
    it('should log debug messages with correct format', async () => {
      // Set log level to DEBUG
      const { logger, LogLevel } = await import('../../utils/logger.js');
      logger.setLogLevel(LogLevel.DEBUG);

      // Log with additional arguments
      logger.debug('Debug message', { data: 'test' }, 123);

      // Check format and arguments
      expect(console.debug).toHaveBeenCalledWith(
        '[DEBUG] Debug message', 
        { data: 'test' }, 
        123
      );
    });

    it('should log info messages with correct format', async () => {
      // Get logger instance
      const { logger } = await import('../../utils/logger.js');

      // Log with additional arguments
      logger.info('Info message', { data: 'test' }, 123);

      // Check format and arguments
      expect(console.log).toHaveBeenCalledWith(
        '[INFO] Info message', 
        { data: 'test' }, 
        123
      );
    });

    it('should log warning messages with correct format', async () => {
      // Get logger instance
      const { logger } = await import('../../utils/logger.js');

      // Log with additional arguments
      logger.warn('Warning message', { data: 'test' }, 123);

      // Check format and arguments
      expect(console.warn).toHaveBeenCalledWith(
        '[WARN] Warning message', 
        { data: 'test' }, 
        123
      );
    });

    it('should log error messages with correct format', async () => {
      // Get logger instance
      const { logger } = await import('../../utils/logger.js');

      // Log with additional arguments
      logger.error('Error message', { data: 'test' }, 123);

      // Check format and arguments
      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] Error message', 
        { data: 'test' }, 
        123
      );
    });
  });
});
