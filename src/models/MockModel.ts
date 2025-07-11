import { ModelInterface } from './ModelInterface.js';
import { logger } from '../utils/logger.js';

/**
 * Mock model implementation for testing
 */
export class MockModel implements ModelInterface {
  /**
   * Summarize a list of messages (mock implementation)
   * @param messages Array of messages to summarize
   * @param formatted Optional flag to generate a formatted summary with topics and user perspectives
   * @param timeout Optional timeout in milliseconds
   * @param customPrompt Optional custom prompt to personalize the summary
   * @returns Promise resolving to a mock summary
   */
  public async summarize(
    messages: string[],
    formatted: boolean = false,
    timeout: number = 30000,
    customPrompt?: string,
    language: string = 'english',
  ): Promise<string> {
    // For testing timeouts
    if (timeout === 0) {
      throw new Error('Timeout error');
    }

    // Validate custom prompt if provided
    if (customPrompt) {
      try {
        // Import the prompt validator
        const { validatePrompt } = await import('../utils/promptValidator.js');

        const validation = validatePrompt(customPrompt);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid custom prompt');
        }
      } catch (error) {
        logger.error('Error validating custom prompt:', error);
        throw new Error(`Failed to validate custom prompt: ${(error as Error).message}`);
      }
    }

    if (formatted) {
      if (language.toLowerCase() === 'spanish') {
        return `# 📝 Resumen\n\n**Temas Principales:**\n* Tema 1\n* Tema 2\n\n## 👥 Perspectivas\n\n**Usuario1:**\n* Punto de vista sobre tema 1\n\n**Usuario2:**\n* Punto de vista sobre tema 2`;
      }
      return `# 📝 Summary\n\n**Main Topics:**\n* Topic 1\n* Topic 2\n\n## 👥 Perspectives\n\n**User1:**\n* Point of view on topic 1\n\n**User2:**\n* Point of view on topic 2`;
    }

    if (language.toLowerCase() === 'spanish') {
      return `Resumidos ${messages.length} mensajes${customPrompt ? ' con prompt personalizado' : ''}`;
    }
    return `Summarized ${messages.length} messages${customPrompt ? ' with custom prompt' : ''}`;
  }

  /**
   * Process a general prompt (mock implementation)
   * @param prompt The prompt to process
   * @param timeout Optional timeout in milliseconds
   * @returns Promise resolving to a mock response
   */
  public async processPrompt(prompt: string, timeout: number = 30000): Promise<string> {
    // For testing timeouts
    if (timeout === 0) {
      throw new Error('Timeout error');
    }

    // Validate prompt
    try {
      // Import the prompt validator
      const { validatePrompt } = await import('../utils/promptValidator.js');

      const validation = validatePrompt(prompt);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid prompt');
      }
    } catch (error) {
      logger.error('Error validating prompt:', error);
      throw new Error(`Failed to validate prompt: ${(error as Error).message}`);
    }

    return `This is a mock response to: "${prompt}" from MockModel`;
  }

  /**
   * Get the name of the model
   * @returns The name of the model
   */
  public getName(): string {
    return 'MockModel';
  }
}
