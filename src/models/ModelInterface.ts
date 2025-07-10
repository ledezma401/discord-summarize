/**
 * Interface for AI models that can summarize text
 */
export interface ModelInterface {
  /**
   * Summarize a list of messages
   * @param messages Array of messages to summarize
   * @param formatted Optional flag to generate a formatted summary with topics and user perspectives
   * @param timeout Optional timeout in milliseconds
   * @param customPrompt Optional custom prompt to personalize the summary
   * @param language Optional language for the summary (default: 'english', options: 'english', 'spanish')
   * @returns Promise resolving to the summarized text
   */
  summarize(messages: string[], formatted?: boolean, timeout?: number, customPrompt?: string, language?: string): Promise<string>;

  /**
   * Get the name of the model
   * @returns The name of the model
   */
  getName(): string;
}
