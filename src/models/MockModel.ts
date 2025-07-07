import { ModelInterface } from './ModelInterface.js';

/**
 * Mock model implementation for testing
 */
export class MockModel implements ModelInterface {
  /**
   * Summarize a list of messages (mock implementation)
   * @param messages Array of messages to summarize
   * @param formatted Optional flag to generate a formatted summary with topics and user perspectives
   * @param timeout Optional timeout in milliseconds
   * @returns Promise resolving to a mock summary
   */
  public async summarize(messages: string[], formatted: boolean = false, timeout: number = 30000): Promise<string> {
    // For testing timeouts
    if (timeout === 0) {
      throw new Error('Timeout error');
    }

    if (formatted) {
      return `# 📝 Summary\n\n**Main Topics:**\n* Topic 1\n* Topic 2\n\n## 👥 Perspectives\n\n**User1:**\n* Point of view on topic 1\n\n**User2:**\n* Point of view on topic 2`;
    }
    return `Summarized ${messages.length} messages`;
  }

  /**
   * Get the name of the model
   * @returns The name of the model
   */
  public getName(): string {
    return 'MockModel';
  }
}
