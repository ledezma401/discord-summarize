import { ModelInterface } from './ModelInterface';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Gemini model implementation
 */
export class GeminiModel implements ModelInterface {
  private genAI: GoogleGenerativeAI | null = null;
  private model: string;
  private isTestEnvironment: boolean;

  /**
   * Create a new Gemini model instance
   */
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.isTestEnvironment = process.env.NODE_ENV === 'test';

    if (!apiKey && !this.isTestEnvironment) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }

    // Get the model from environment or use default
    const requestedModel = process.env.GEMINI_MODEL || 'gemini-2.5-pro';

    // Validate the model - only allow specific models
    const allowedModels = ['gemini-2.5-pro', 'gemini-2.5-flash'];

    // In test environment, also allow 'test-model'
    if (this.isTestEnvironment && requestedModel === 'test-model') {
      // Allow test-model in test environment
    } else if (!allowedModels.includes(requestedModel)) {
      throw new Error(
        `Invalid Gemini model: ${requestedModel}. Allowed models are: ${allowedModels.join(', ')}`,
      );
    }

    this.model = requestedModel;
  }

  /**
   * Summarize a list of messages using Gemini
   * @param messages Array of messages to summarize
   * @param formatted Optional flag to generate a formatted summary with topics and user perspectives
   * @returns Promise resolving to the summarized text
   */
  public async summarize(messages: string[], formatted: boolean = false): Promise<string> {
    // In test environment without API key, return a mock summary
    if (this.isTestEnvironment && !this.genAI) {
      if (formatted) {
        return `# 📝 Summary\n\n**Main Topics:**\n* Topic 1\n* Topic 2\n\n## 👥 Perspectives\n\n**User1:**\n* Point of view on topic 1\n\n**User2:**\n* Point of view on topic 2`;
      }
      return `This is a mock summary of ${messages.length} messages from Gemini model`;
    }

    try {
      if (!this.genAI) {
        throw new Error('Gemini client not initialized');
      }

      // Get the generative model
      const geminiModel = this.genAI.getGenerativeModel({ model: this.model });

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

      // Create the chat session
      const chat = geminiModel.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'I understand. I will summarize Discord conversations according to your instructions.',
              },
            ],
          },
        ],
      });

      // Generate the response
      const result = await chat.sendMessage(userPrompt);
      const response = result.response;

      return response.text() || 'Failed to generate summary';
    } catch (error) {
      console.error('Error summarizing with Gemini:', error);
      throw new Error(`Failed to summarize with Gemini: ${(error as Error).message}`);
    }
  }

  /**
   * Get the name of the model
   * @returns The name of the model
   */
  public getName(): string {
    return 'Gemini';
  }
}
