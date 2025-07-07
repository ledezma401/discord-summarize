import { OpenAIModel } from '../../models/OpenAIModel';
import OpenAI from 'openai';

// Mock the OpenAI module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'This is a mock summary',
              },
            },
          ],
        }),
      },
    },
  }));
});

// Mock environment variables
const originalEnv = process.env;

describe('OpenAIModel', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
    process.env.NODE_ENV = 'test';
    process.env.OPENAI_API_KEY = 'test-api-key';
    process.env.OPENAI_MODEL = 'test-model';

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should create an instance with environment variables', () => {
    const model = new OpenAIModel();
    expect(model).toBeInstanceOf(OpenAIModel);
    expect(model.getName()).toBe('OpenAI');
    expect(OpenAI).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
  });

  it('should throw an error if API key is not set in non-test environment', () => {
    delete process.env.OPENAI_API_KEY;
    // Set NODE_ENV to something other than 'test'
    process.env.NODE_ENV = 'production';
    expect(() => new OpenAIModel()).toThrow('OPENAI_API_KEY environment variable is not set');
  });

  it('should not throw an error if API key is not set in test environment', () => {
    delete process.env.OPENAI_API_KEY;
    process.env.NODE_ENV = 'test';
    expect(() => new OpenAIModel()).not.toThrow();
  });

  it('should summarize messages', async () => {
    const model = new OpenAIModel();
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    const summary = await model.summarize(messages);

    // Check that the OpenAI client was called correctly
    const mockOpenAIInstance = (OpenAI as unknown as jest.Mock).mock.results[0].value;
    const mockCreate = mockOpenAIInstance.chat.completions.create;

    expect(mockCreate).toHaveBeenCalledWith({
      model: 'test-model',
      messages: [
        {
          role: 'system',
          content: expect.stringContaining('summarizes Discord conversations'),
        },
        {
          role: 'user',
          content: expect.stringContaining('Message 1'),
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Check the returned summary
    expect(summary).toBe('This is a mock summary');
  });

  it('should handle errors during summarization', async () => {
    // Ensure API key is set so OpenAI client is initialized
    process.env.OPENAI_API_KEY = 'test-api-key';

    // Create a model with initialized OpenAI client
    const model = new OpenAIModel();

    // Mock the OpenAI client to throw an error
    const mockOpenAIInstance = (OpenAI as unknown as jest.Mock).mock.results[0].value;
    mockOpenAIInstance.chat.completions.create.mockRejectedValueOnce(
      new Error('API error'),
    );

    const messages = ['Message 1', 'Message 2', 'Message 3'];

    // The summarize method should throw an error
    await expect(model.summarize(messages)).rejects.toThrow('Failed to summarize with OpenAI: API error');
  });

  it('should provide a mock summary when no API key is set in test environment', async () => {
    // Remove the API key
    delete process.env.OPENAI_API_KEY;

    // Create a model without an API key
    const model = new OpenAIModel();
    const messages = ['Message 1', 'Message 2', 'Message 3'];

    // The summarize method should return a mock summary
    const summary = await model.summarize(messages);
    expect(summary).toBe('This is a mock summary of 3 messages from OpenAI model');
  });

  it('should provide a formatted mock summary when no API key is set in test environment', async () => {
    // Remove the API key
    delete process.env.OPENAI_API_KEY;

    // Create a model without an API key
    const model = new OpenAIModel();
    const messages = ['Message 1', 'Message 2', 'Message 3'];

    // The summarize method should return a formatted mock summary
    const summary = await model.summarize(messages, true);
    expect(summary).toContain('# 📝 Summary');
    expect(summary).toContain('**Main Topics:**');
    expect(summary).toContain('## 👥 Perspectives');
  });
});
