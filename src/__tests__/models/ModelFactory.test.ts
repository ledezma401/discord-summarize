import { ModelFactory } from '../../models/ModelFactory.js';
import { ModelInterface } from '../../models/ModelInterface.js';

// Mock model implementation for testing
class MockModel implements ModelInterface {
  async summarize(messages: string[]): Promise<string> {
    return `Summarized ${messages.length} messages`;
  }

  getName(): string {
    return 'MockModel';
  }
}

describe('ModelFactory', () => {
  beforeEach(() => {
    // Clear any registered models before each test
    // This is a workaround since we can't directly access the private models Map
    try {
      ModelFactory.createModel('mockmodel');
    } catch {
      // Expected error if model is not registered
    }
  });

  it('should register and create a model', () => {
    // Register the mock model
    ModelFactory.registerModel('mockmodel', MockModel);

    // Get available models
    const availableModels = ModelFactory.getAvailableModels();
    expect(availableModels).toContain('mockmodel');

    // Create an instance of the model
    const model = ModelFactory.createModel('mockmodel');
    expect(model).toBeInstanceOf(MockModel);
    expect(model.getName()).toBe('MockModel');
  });

  it('should handle case-insensitive model names', () => {
    // Register the mock model
    ModelFactory.registerModel('MockModel', MockModel);

    // Create an instance with different case
    const model = ModelFactory.createModel('mockmodel');
    expect(model).toBeInstanceOf(MockModel);

    // Check available models
    const availableModels = ModelFactory.getAvailableModels();
    expect(availableModels).toContain('mockmodel');
  });

  it('should throw an error for unregistered models', () => {
    // Try to create an unregistered model
    expect(() => {
      ModelFactory.createModel('nonexistentmodel');
    }).toThrow('Model "nonexistentmodel" not registered');
  });

  it('should correctly summarize messages using the model', async () => {
    // Register the mock model
    ModelFactory.registerModel('mockmodel', MockModel);

    // Create an instance of the model
    const model = ModelFactory.createModel('mockmodel');

    // Summarize some messages
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    const summary = await model.summarize(messages);
    expect(summary).toBe('Summarized 3 messages');
  });
});
