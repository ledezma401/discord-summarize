/**
 * Interface for AI models that can summarize text
 */
export interface ModelInterface {
  /**
   * Summarize a list of messages
   * @param messages Array of messages to summarize
   * @param formatted Optional flag to generate a formatted summary with topics and user perspectives
   * @returns Promise resolving to the summarized text
   */
  summarize(messages: string[], formatted?: boolean): Promise<string>;

  /**
   * Get the name of the model
   * @returns The name of the model
   */
  getName(): string;
}
