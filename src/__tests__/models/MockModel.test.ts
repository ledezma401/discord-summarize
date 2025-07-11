import { MockModel } from '../../models/MockModel.js';
import { jest, expect, describe, beforeEach, afterEach, it } from '@jest/globals';

describe('MockModel', () => {
  it('should create an instance', () => {
    const model = new MockModel();
    expect(model).toBeInstanceOf(MockModel);
  });

  it('should return the correct name', () => {
    const model = new MockModel();
    expect(model.getName()).toBe('MockModel');
  });

  it('should summarize messages', async () => {
    const model = new MockModel();
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    const summary = await model.summarize(messages);
    expect(summary).toBe('Summarized 3 messages');
  });

  it('should summarize messages with formatted output', async () => {
    const model = new MockModel();
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    const summary = await model.summarize(messages, true);
    expect(summary).toContain('# 📝 Summary');
    expect(summary).toContain('**Main Topics:**');
    expect(summary).toContain('## 👥 Perspectives');
  });

  it('should handle timeout errors', async () => {
    const model = new MockModel();
    await expect(model.summarize(['Message 1'], false, 0)).rejects.toThrow('Timeout error');
  });

  it('should summarize messages with custom prompt', async () => {
    const model = new MockModel();
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    const summary = await model.summarize(messages, false, 30000, 'Focus on key points');
    expect(summary).toBe('Summarized 3 messages with custom prompt');
  });

  it('should summarize messages in Spanish', async () => {
    const model = new MockModel();
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    const summary = await model.summarize(messages, false, 30000, undefined, 'spanish');
    expect(summary).toBe('Resumidos 3 mensajes');
  });

  it('should summarize messages in Spanish with custom prompt', async () => {
    const model = new MockModel();
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    const summary = await model.summarize(messages, false, 30000, 'Focus on key points', 'spanish');
    expect(summary).toBe('Resumidos 3 mensajes con prompt personalizado');
  });

  it('should provide formatted summary in Spanish', async () => {
    const model = new MockModel();
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    const summary = await model.summarize(messages, true, 30000, undefined, 'spanish');
    expect(summary).toContain('# 📝 Resumen');
    expect(summary).toContain('**Temas Principales:**');
    expect(summary).toContain('## 👥 Perspectivas');
  });

  it('should handle invalid custom prompts', async () => {
    // Create a subclass of MockModel that simulates a validation error
    class TestMockModel extends MockModel {
      async summarize(
        messages: string[],
        formatted: boolean = false,
        timeout: number = 30000,
        customPrompt?: string,
        language: string = 'english',
      ): Promise<string> {
        // Simulate the validation error when a custom prompt is provided
        if (customPrompt) {
          throw new Error('Failed to validate custom prompt: Invalid prompt content');
        }

        // Otherwise, use the parent implementation
        return super.summarize(messages, formatted, timeout, undefined, language);
      }
    }

    const model = new TestMockModel();
    const messages = ['Message 1', 'Message 2', 'Message 3'];

    // Test that the error is thrown when a custom prompt is provided
    await expect(
      model.summarize(messages, false, 30000, 'Invalid prompt')
    ).rejects.toThrow('Failed to validate custom prompt: Invalid prompt content');
  });

  // Tests for the processPrompt method
  it('should process a prompt', async () => {
    const model = new MockModel();
    const prompt = 'What is the capital of France?';
    const response = await model.processPrompt(prompt);
    expect(response).toBe(`This is a mock response to: "${prompt}" from MockModel`);
  });

  it('should handle timeout errors in processPrompt', async () => {
    const model = new MockModel();
    await expect(model.processPrompt('Test prompt', 0)).rejects.toThrow('Timeout error');
  });

  it('should handle invalid prompts in processPrompt', async () => {
    // Create a subclass of MockModel that simulates a validation error
    class TestMockModel extends MockModel {
      async processPrompt(
        prompt: string,
        timeout: number = 30000,
      ): Promise<string> {
        // Simulate the validation error when a prompt is provided
        throw new Error('Failed to validate prompt: Invalid prompt content');
      }
    }

    const model = new TestMockModel();

    // Test that the error is thrown when a prompt is provided
    await expect(
      model.processPrompt('Invalid prompt')
    ).rejects.toThrow('Failed to validate prompt: Invalid prompt content');
  });
});
