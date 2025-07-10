import { Message, CommandInteraction, TextChannel, Collection } from 'discord.js';
import { handleSummarizeGCommand } from '../../commands/summarizeg.js';
import { ModelFactory } from '../../models/ModelFactory.js';
import { jest, expect, describe, beforeEach, it } from '@jest/globals';

// Mock the config
jest.mock('../../utils/config.js', () => ({
  config: {
    defaultMessageCount: 50,
  },
}));

// Mock the ModelFactory module
jest.mock('../../models/ModelFactory.js');

// Setup ModelFactory mock implementation
beforeEach(() => {
  // Reset the mock implementation
  ModelFactory.createModel = jest.fn() as unknown as typeof ModelFactory.createModel;
  ModelFactory.getAvailableModels = jest.fn().mockReturnValue(['openai', 'mock']) as unknown as typeof ModelFactory.getAvailableModels;
});

// Mock OpenAI model for testing
jest.mock('../../models/OpenAIModel.js', () => {
  return {
    OpenAIModel: jest.fn().mockImplementation(() => {
      return {
        summarize: jest.fn().mockImplementation((messages, formatted, timeout, customPrompt) => {
          if (timeout === 0) {
            throw new Error('Timeout error');
          }
          if (formatted) {
            const customPromptText = customPrompt ? ` (Custom: ${customPrompt})` : '';
            return Promise.resolve(
              `# 📝 Summary${customPromptText}\n\n**Main Topics:**\n* Topic 1\n* Topic 2\n\n## 👥 Perspectives\n\n**User1:**\n* Point of view on topic 1\n\n**User2:**\n* Point of view on topic 2`,
            );
          }
          return Promise.resolve(`This is a summary from OpenAI${customPrompt ? ' with custom prompt' : ''}`);
        }),
        getName: jest.fn().mockReturnValue('OpenAI'),
      };
    }),
  };
});

// Mock MockModel for testing
jest.mock('../../models/MockModel.js', () => {
  return {
    MockModel: jest.fn().mockImplementation(() => {
      return {
        summarize: jest.fn().mockImplementation((messages, formatted, timeout, customPrompt) => {
          if (timeout === 0) {
            throw new Error('Timeout error');
          }
          if (formatted) {
            const customPromptText = customPrompt ? ` (Custom: ${customPrompt})` : '';
            return Promise.resolve(
              `# 📝 Summary${customPromptText}\n\n**Main Topics:**\n* Topic 1\n* Topic 2\n\n## 👥 Perspectives\n\n**User1:**\n* Point of view on topic 1\n\n**User2:**\n* Point of view on topic 2`,
            );
          }
          return Promise.resolve(`This is a summary from MockModel${customPrompt ? ' with custom prompt' : ''}`);
        }),
        getName: jest.fn().mockReturnValue('MockModel'),
      };
    }),
  };
});

// Mock the summarizeg module functions
jest.mock('../../commands/summarizeg.js', () => {
  // Get the original module
  const originalModule = jest.requireActual('../../commands/summarizeg.js');

  // Mock the internal functions
  return {
    ...originalModule,
    // Export the handleSummarizeGCommand function but mock the internal functions
    handleSummarizeGCommand: jest.fn().mockImplementation(originalModule.handleSummarizeGCommand),
  };
});

describe('handleSummarizeGCommand', () => {
  // Mock objects
  let mockMessage: Message;
  let mockInteraction: CommandInteraction;
  let mockChannel: TextChannel;
  let mockMessages: Collection<string, Message>;
  let mockOpenAIModel: { summarize: jest.Mock; getName: jest.Mock };
  let mockReplyMessage: Message & { edit: jest.Mock };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock messages
    mockMessages = new Collection<string, Message>();
    for (let i = 1; i <= 3; i++) {
      const mockMsg = {
        id: `msg${i}`,
        content: `Message content ${i}`,
        author: { username: `User${i}` },
      } as unknown as Message;
      mockMessages.set(mockMsg.id, mockMsg);
    }

    // Create mock channel
    mockChannel = {
      messages: {
        fetch: jest.fn().mockResolvedValue(mockMessages),
      },
    } as unknown as TextChannel;

    // Create mock message with reply that returns a mock message
    mockReplyMessage = {
      edit: jest.fn().mockResolvedValue(undefined),
    } as unknown as Message & { edit: jest.Mock };

    mockMessage = {
      channel: mockChannel,
      reply: jest.fn().mockResolvedValue(mockReplyMessage),
    } as unknown as Message & { reply: jest.Mock };

    // Create mock interaction
    mockInteraction = {
      channel: mockChannel,
      deferReply: jest.fn().mockResolvedValue(undefined),
      editReply: jest.fn().mockResolvedValue(undefined),
      reply: jest.fn().mockResolvedValue(undefined),
      deferred: false,
      replied: false,
    } as unknown as CommandInteraction & { editReply: jest.Mock };

    // Create a mock OpenAI model with a jest.fn() for summarize
    mockOpenAIModel = {
      summarize: jest.fn().mockImplementation((messages, formatted, timeout, customPrompt) => {
        if (timeout === 0) {
          throw new Error('Timeout error');
        }
        if (formatted) {
          const customPromptText = customPrompt ? ` (Custom: ${customPrompt})` : '';
          return Promise.resolve(
            `# 📝 Summary${customPromptText}\n\n**Main Topics:**\n* Topic 1\n* Topic 2\n\n## 👥 Perspectives\n\n**User1:**\n* Point of view on topic 1\n\n**User2:**\n* Point of view on topic 2`,
          );
        }
        return Promise.resolve(`This is a summary from OpenAI${customPrompt ? ' with custom prompt: ' + customPrompt : ''}`);
      }),
      getName: jest.fn().mockReturnValue('OpenAI'),
    };

    // Set up the ModelFactory.createModel mock to return our mockOpenAIModel
    ModelFactory.createModel.mockReturnValue(mockOpenAIModel);
  });

  it('should handle message command', async () => {
    await handleSummarizeGCommand(mockMessage);

    // Check that messages were fetched with default limit
    expect(mockChannel.messages.fetch).toHaveBeenCalledWith({ limit: 50 });

    // Check that the model was created
    expect(ModelFactory.createModel).toHaveBeenCalledWith('openai');

    // Check that a reply was sent
    expect(mockMessage.reply).toHaveBeenCalled();

    // Check that the summarize method was called with formatted=true
    expect(mockOpenAIModel.summarize).toHaveBeenCalledWith(expect.any(Array), true, undefined, undefined, 'english');
  });

  it('should handle message command with custom count', async () => {
    const customCount = 100;
    await handleSummarizeGCommand(mockMessage, customCount);

    // Check that messages were fetched with custom limit
    expect(mockChannel.messages.fetch).toHaveBeenCalledWith({ limit: customCount });
  });

  it('should handle interaction command', async () => {
    await handleSummarizeGCommand(mockInteraction, 10, 'openai');

    // Check that messages were fetched with specified limit
    expect(mockChannel.messages.fetch).toHaveBeenCalledWith({ limit: 10 });

    // Check that the model was created
    expect(ModelFactory.createModel).toHaveBeenCalledWith('openai');

    // Check that a reply was sent
    expect(mockInteraction.reply).toHaveBeenCalled();

    // Check that the summarize method was called with formatted=true
    expect(mockOpenAIModel.summarize).toHaveBeenCalledWith(expect.any(Array), true, undefined, undefined, 'english');
  });

  it('should handle errors when fetching messages', async () => {
    // Mock channel.messages.fetch to throw an error
    mockChannel.messages.fetch = jest.fn().mockRejectedValue(new Error('Fetch error'));

    await handleSummarizeGCommand(mockMessage);

    // Check that the error was handled
    expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('An error occurred'));
  });

  it('should handle errors when creating model', async () => {
    // Mock ModelFactory.createModel to throw an error
    ModelFactory.createModel.mockImplementation(() => {
      throw new Error('Invalid model');
    });

    await handleSummarizeGCommand(mockMessage);

    // Check that an error reply was sent
    expect(mockMessage.reply).toHaveBeenCalled();
  });

  it('should handle empty message collections', async () => {
    // Mock channel.messages.fetch to return empty collection
    mockChannel.messages.fetch = jest.fn().mockResolvedValue(new Collection<string, Message>());

    await handleSummarizeGCommand(mockMessage);

    // Check that a reply was sent
    expect(mockMessage.reply).toHaveBeenCalledWith('No messages found to summarize.');
  });

  it('should handle timeout errors', async () => {
    // Create a mock OpenAI model that throws a timeout error
    const timeoutModel = {
      summarize: jest.fn().mockImplementation(() => {
        throw new Error('Timeout error');
      }),
      getName: jest.fn().mockReturnValue('OpenAI'),
    };

    // Mock ModelFactory.createModel to return the timeout model
    ModelFactory.createModel.mockReturnValue(timeoutModel);

    await handleSummarizeGCommand(mockMessage);

    // Check that an error reply was sent
    expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('Error: Timeout error'));
  }, 10000); // Increase timeout to 10 seconds

  it('should handle message command with custom prompt', async () => {
    const customPrompt = 'Focus on the key decisions made';
    await handleSummarizeGCommand(mockMessage, null, null, customPrompt);

    // Check that the model was created
    expect(ModelFactory.createModel).toHaveBeenCalledWith('openai');

    // Check that summarize was called with the custom prompt
    expect(mockOpenAIModel.summarize).toHaveBeenCalledWith(
      expect.any(Array),
      true,
      undefined,
      customPrompt,
      'english'
    );

    // Check that a reply was sent
    expect(mockMessage.reply).toHaveBeenCalled();
  });

  it('should handle interaction command with custom prompt', async () => {
    const customPrompt = 'Highlight any action items';
    await handleSummarizeGCommand(mockInteraction, 10, 'openai', customPrompt);

    // Check that messages were fetched with specified limit
    expect(mockChannel.messages.fetch).toHaveBeenCalledWith({ limit: 10 });

    // Check that the model was created
    expect(ModelFactory.createModel).toHaveBeenCalledWith('openai');

    // Check that summarize was called with the custom prompt
    expect(mockOpenAIModel.summarize).toHaveBeenCalledWith(
      expect.any(Array),
      true,
      undefined,
      customPrompt,
      'english'
    );

    // Check that a reply was sent
    expect(mockInteraction.reply).toHaveBeenCalled();
  }, 10000); // Increase timeout to 10 seconds
});
