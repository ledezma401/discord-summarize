import { Message, CommandInteraction, EmbedBuilder } from 'discord.js';
import { handleHelpCommand } from '../../commands/help.js';
import { jest, expect, describe, beforeEach, it } from '@jest/globals';

// Mock the help module functions
jest.mock('../../commands/help.js', () => {
  // Get the original module
  const originalModule = jest.requireActual('../../commands/help.js');

  // Mock the internal functions
  return {
    ...originalModule,
    // Export the handleHelpCommand function but mock the internal functions
    handleHelpCommand: jest.fn().mockImplementation(originalModule.handleHelpCommand),
  };
});

describe('handleHelpCommand', () => {
  // Mock objects
  let mockMessage: Message;
  let mockInteraction: CommandInteraction;
  let mockReplyMessage: Message & { edit: jest.Mock };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock message with reply that returns a mock message
    mockReplyMessage = {
      edit: jest.fn().mockResolvedValue(undefined),
    } as unknown as Message & { edit: jest.Mock };

    mockMessage = {
      reply: jest.fn().mockResolvedValue(mockReplyMessage),
    } as unknown as Message & { reply: jest.Mock };

    // Create mock interaction
    mockInteraction = {
      deferReply: jest.fn().mockResolvedValue(undefined),
      editReply: jest.fn().mockResolvedValue(undefined),
      reply: jest.fn().mockResolvedValue(undefined),
      deferred: false,
      replied: false,
    } as unknown as CommandInteraction & { editReply: jest.Mock };
  });

  it('should handle message command', async () => {
    await handleHelpCommand(mockMessage);

    // Check that a reply was sent
    expect(mockMessage.reply).toHaveBeenCalled();
    
    // Verify that the reply contains an embed
    const replyArg = mockMessage.reply.mock.calls[0][0];
    expect(replyArg).toHaveProperty('embeds');
    expect(replyArg.embeds).toHaveLength(1);
    
    // Verify that the embed has the correct title and fields
    const embed = replyArg.embeds[0];
    expect(embed.data.title).toBe('Discord Summarize Bot - Available Commands');
    expect(embed.data.fields).toHaveLength(5); // 5 command fields
    
    // Verify that all commands are included in the help message
    const fieldNames = embed.data.fields.map(field => field.name);
    expect(fieldNames).toContain('!summarize / /summarize');
    expect(fieldNames).toContain('!tldr / /tldr');
    expect(fieldNames).toContain('!summarizeg / /summarizeg');
    expect(fieldNames).toContain('!tldrg / /tldrg');
    expect(fieldNames).toContain('!help / /help');
  });

  it('should handle interaction command', async () => {
    await handleHelpCommand(mockInteraction);

    // Check that a reply was sent
    expect(mockInteraction.reply).toHaveBeenCalled();
    
    // Verify that the reply contains an embed
    const replyArg = mockInteraction.reply.mock.calls[0][0];
    expect(replyArg).toHaveProperty('embeds');
    expect(replyArg.embeds).toHaveLength(1);
    
    // Verify that the embed has the correct title and fields
    const embed = replyArg.embeds[0];
    expect(embed.data.title).toBe('Discord Summarize Bot - Available Commands');
    expect(embed.data.fields).toHaveLength(5); // 5 command fields
  });

  it('should handle errors gracefully', async () => {
    // Mock the reply function to throw an error
    mockMessage.reply = jest.fn().mockRejectedValue(new Error('Reply error'));

    await handleHelpCommand(mockMessage);

    // Check that the reply was attempted
    expect(mockMessage.reply).toHaveBeenCalled();
    
    // No assertion for error handling since it's logged but not re-thrown
  });

  it('should handle deferred interaction', async () => {
    // Set interaction as deferred
    mockInteraction.deferred = true;

    await handleHelpCommand(mockInteraction);

    // Check that editReply was called instead of reply
    expect(mockInteraction.editReply).toHaveBeenCalled();
    expect(mockInteraction.reply).not.toHaveBeenCalled();
  });

  it('should handle replied interaction', async () => {
    // Set interaction as replied
    mockInteraction.replied = true;

    await handleHelpCommand(mockInteraction);

    // Check that editReply was called instead of reply
    expect(mockInteraction.editReply).toHaveBeenCalled();
    expect(mockInteraction.reply).not.toHaveBeenCalled();
  });
});