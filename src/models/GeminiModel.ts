/// <reference types="node" />
import { ModelInterface } from './ModelInterface.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
import { generateSystemPrompt, generateUserPrompt } from '../prompts/summaryPrompts.js';
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
  public async summarize(
    messages: string[],
    formatted: boolean = false,
    timeout: number = 90000,
    customPrompt?: string,
    language: string = 'english',
  ): Promise<string> {
    // In test environment without API key, return a mock summary
    if (this.isTestEnvironment && !this.genAI) {
      if (formatted) {
        return `# 📝 Summary\n\n**Main Topics:**\n* Topic 1\n* Topic 2\n\n## 👥 Perspectives\n\n**User1:**\n* Point of view on topic 1\n\n**User2:**\n* Point of view on topic 2`;
      }
      return `This is a mock summary of ${messages.length} messages from Gemini model`;
    }

    // For testing timeouts
    if (this.isTestEnvironment && timeout === 0) {
      throw new Error('Timeout error');
    }

    // Create an AbortController to handle timeouts (skip in test environment)
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      if (!this.genAI) {
        throw new Error('Gemini client not initialized');
      }

      // Set the timeout if needed
      timeoutId = this.isTestEnvironment
        ? null
        : timeout > 0
          ? setTimeout(() => controller.abort(), timeout)
          : null;

      // Get the generative model
      const geminiModel = this.genAI.getGenerativeModel({ model: this.model });

      // Import the prompt validator
      const { validatePrompt, sanitizePrompt } = await import('../utils/promptValidator.js');

      // Validate custom prompt if provided
      let sanitizedCustomPrompt: string | undefined = undefined;
      if (customPrompt) {
        const validation = validatePrompt(customPrompt);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid custom prompt');
        }

        // Sanitize the custom prompt
        sanitizedCustomPrompt = sanitizePrompt(customPrompt);
      }

      // Generate prompts using the extracted prompt engineering module
      const systemPrompt = generateSystemPrompt(formatted, language);
      const userPrompt = generateUserPrompt(formatted, language, sanitizedCustomPrompt, messages);

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
      const result = await chat.sendMessage(userPrompt, { signal: controller.signal });
      const response = result.response;

      // Clear the timeout if it exists
      if (timeoutId) clearTimeout(timeoutId);

      return response.text() || 'Failed to generate summary';
    } catch (error) {
      // Clear the timeout if it exists
      if (timeoutId) clearTimeout(timeoutId);

      // Check if this is an abort error (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout error');
      }

      logger.error('Error summarizing with Gemini:', error);
      throw new Error(`Failed to summarize with Gemini: ${(error as Error).message}`);
    }
  }

  /**
   * For testing purposes - allows overriding the Gemini client
   * @param client The Gemini client to use
   */
  public setGeminiClient(client: GoogleGenerativeAI): void {
    if (this.isTestEnvironment) {
      this.genAI = client;
    }
  }

  /**
   * Process a general prompt using Gemini
   * @param prompt The prompt to process
   * @param timeout Optional timeout in milliseconds
   * @returns Promise resolving to the model's response
   */
  public async processPrompt(prompt: string, timeout: number = 90000): Promise<string> {
    // In test environment without API key, return a mock response
    if (this.isTestEnvironment && !this.genAI) {
      return `This is a mock response to: "${prompt}" from Gemini model`;
    }

    // For testing timeouts
    if (this.isTestEnvironment && timeout === 0) {
      throw new Error('Timeout error');
    }

    // Create an AbortController to handle timeouts (skip in test environment)
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      if (!this.genAI) {
        throw new Error('Gemini client not initialized');
      }

      // Set the timeout if needed
      timeoutId = this.isTestEnvironment
        ? null
        : timeout > 0
          ? setTimeout(() => controller.abort(), timeout)
          : null;

      // Get the generative model
      const geminiModel = this.genAI.getGenerativeModel({ model: this.model });

      // Import the prompt validator
      const { validatePrompt, sanitizePrompt } = await import('../utils/promptValidator.js');

      // Validate prompt
      const validation = validatePrompt(prompt);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid prompt');
      }

      // Sanitize the prompt
      const sanitizedPrompt = sanitizePrompt(prompt);

      // Generate the response
      const result = await geminiModel.generateContent(sanitizedPrompt, {
        signal: controller.signal,
      });
      const response = result.response;

      // Clear the timeout if it exists
      if (timeoutId) clearTimeout(timeoutId);

      return response.text() || 'Failed to generate response';
    } catch (error) {
      // Clear the timeout if it exists
      if (timeoutId) clearTimeout(timeoutId);

      // Check if this is an abort error (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout error');
      }

      logger.error('Error processing prompt with Gemini:', error);
      throw new Error(`Failed to process prompt with Gemini: ${(error as Error).message}`);
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
