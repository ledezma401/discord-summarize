import { OpenAIModel } from '../../models/OpenAIModel';

// Skip these tests if no API key is provided
const hasApiKey = !!process.env.OPENAI_API_KEY;

// These tests connect to the actual OpenAI service
// They should only be run when explicitly requested
describe('OpenAIModel Integration', () => {
  // Skip all tests if no API key is available
  beforeAll(() => {
    if (!hasApiKey) {
      console.warn('Skipping OpenAI integration tests: No API key provided');
    }
  });

  it('should connect to OpenAI and summarize messages', async () => {
    // Skip this test if no API key is available
    if (!hasApiKey) {
      return;
    }

    const model = new OpenAIModel();
    const messages = [
      'User1: Hello everyone!',
      'User2: Hi there, how are you doing?',
      'User1: I\'m doing great, just working on some code.',
      'User3: What are you working on?',
      'User1: I\'m building a Discord bot that can summarize conversations.',
    ];

    const summary = await model.summarize(messages);
    
    // Verify we got a non-empty response
    expect(summary).toBeTruthy();
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(10);
  }, 30000); // Increase timeout for API call

  it('should handle empty message arrays', async () => {
    // Skip this test if no API key is available
    if (!hasApiKey) {
      return;
    }

    const model = new OpenAIModel();
    const messages: string[] = [];

    const summary = await model.summarize(messages);
    
    // Verify we got a response
    expect(summary).toBeTruthy();
  }, 30000); // Increase timeout for API call
});