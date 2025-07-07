import { ModelInterface } from './ModelInterface';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * OpenAI model implementation
 */
export class OpenAIModel implements ModelInterface {
  private openai: OpenAI | null = null;
  private model: string;
  private isTestEnvironment: boolean;

  /**
   * Create a new OpenAI model instance
   */
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.isTestEnvironment = process.env.NODE_ENV === 'test';

    if (!apiKey && !this.isTestEnvironment) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
      });
    }

    // Get the model from environment or use default
    const requestedModel = process.env.OPENAI_MODEL || 'gpt-4-turbo';

    // Validate the model - only allow specific models
    const allowedModels = ['gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];

    // In test environment, also allow 'test-model'
    if (this.isTestEnvironment && requestedModel === 'test-model') {
      // Allow test-model in test environment
    } else if (!allowedModels.includes(requestedModel)) {
      throw new Error(
        `Invalid OpenAI model: ${requestedModel}. Allowed models are: ${allowedModels.join(', ')}`,
      );
    }

    this.model = requestedModel;
  }

  /**
   * Summarize a list of messages using OpenAI
   * @param messages Array of messages to summarize
   * @param formatted Optional flag to generate a formatted summary with topics and user perspectives
   * @returns Promise resolving to the summarized text
   */
  public async summarize(messages: string[], formatted: boolean = false): Promise<string> {
    // In test environment without API key, return a mock summary
    if (this.isTestEnvironment && !this.openai) {
      if (formatted) {
        return `# 📝 Summary\n\n**Main Topics:**\n* Topic 1\n* Topic 2\n\n## 👥 Perspectives\n\n**User1:**\n* Point of view on topic 1\n\n**User2:**\n* Point of view on topic 2`;
      }
      return `This is a mock summary of ${messages.length} messages from OpenAI model`;
    }

    try {
      if (!this.openai) {
        throw new Error('OpenAI client not initialized');
      }

      let systemPrompt = 'You are a helpful assistant that summarizes Discord conversations. ';
      let userPrompt = '';

      if (formatted) {
        systemPrompt +=
          'Create a well-structured summary with the following format: ' +
          '1) A clear summary of the main topics being discussed, ' +
          "2) Each user's opinion or take on the main topics, presented one after another. " +
          'If several topics are discussed by different users, summarize what each person discussed. ' +
          'If an opinion/take cannot be detected for some users, they can be ignored. ' +
          'Use formatting like bold text, bullet points, and emojis to highlight key elements, but keep it minimal to ensure readability. ' +
          'The output should follow this structure:\n' +
          '<summary_of_main_topics>\n\n' +
          '<user_1_opinion>\n\n' +
          '<user_2_opinion>\n\n' +
          '<user_3_opinion>';

        userPrompt = `Please create a structured summary of the following conversation, clearly showing the main topics and each user's opinion or perspective on those topics:\n\n${messages.join('\n')}`;
      } else {
        systemPrompt +=
          'Create a concise summary that captures the main points and important details.';
        userPrompt = `Please summarize the following conversation:\n\n${messages.join('\n')}`;
      }

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || 'Failed to generate summary';
    } catch (error) {
      console.error('Error summarizing with OpenAI:', error);
      throw new Error(`Failed to summarize with OpenAI: ${(error as Error).message}`);
    }
  }

  /**
   * Get the name of the model
   * @returns The name of the model
   */
  public getName(): string {
    return 'OpenAI';
  }
}
