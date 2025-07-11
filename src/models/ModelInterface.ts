/**
 * Interface for AI models that can summarize text and process prompts
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
  summarize(
    messages: string[],
    formatted?: boolean,
    timeout?: number,
    customPrompt?: string,
    language?: string,
  ): Promise<string>;

  /**
   * Process a general prompt
   * @param prompt The prompt to process
   * @param timeout Optional timeout in milliseconds
   * @returns Promise resolving to the model's response
   */
  processPrompt(prompt: string, timeout?: number): Promise<string>;

  /**
   * Get the name of the model
   * @returns The name of the model
   */
  getName(): string;
}
