import { generateSystemPrompt, generateUserPrompt } from '../../prompts/summaryPrompts.js';
import { jest, expect, describe, it } from '@jest/globals';

describe('summaryPrompts', () => {
  describe('generateSystemPrompt', () => {
    it('should generate a basic system prompt in English by default', () => {
      const prompt = generateSystemPrompt(false);
      expect(prompt).toContain('You are a helpful assistant that summarizes Discord conversations');
      expect(prompt).toContain('Provide the summary in English');
      expect(prompt).toContain('Create a concise summary that captures the main points and important details');
    });

    it('should generate a system prompt in Spanish when specified', () => {
      const prompt = generateSystemPrompt(false, 'spanish');
      expect(prompt).toContain('You are a helpful assistant that summarizes Discord conversations');
      expect(prompt).toContain('Provide the summary in Spanish');
      expect(prompt).toContain('Create a concise summary that captures the main points and important details');
    });

    it('should generate a formatted system prompt when formatted is true', () => {
      const prompt = generateSystemPrompt(true);
      expect(prompt).toContain('You are a helpful assistant that summarizes Discord conversations');
      expect(prompt).toContain('Provide the summary in English');
      expect(prompt).toContain('Create a well-structured summary with the following format');
      expect(prompt).toContain('1) A clear summary of the main topics being discussed');
      expect(prompt).toContain('2) Each user\'s opinion or take on the main topics');
      expect(prompt).toContain('<summary_of_main_topics>');
      expect(prompt).toContain('<user_1_opinion>');
    });

    it('should generate a formatted system prompt in Spanish when specified', () => {
      const prompt = generateSystemPrompt(true, 'spanish');
      expect(prompt).toContain('You are a helpful assistant that summarizes Discord conversations');
      expect(prompt).toContain('Provide the summary in Spanish');
      expect(prompt).toContain('Create a well-structured summary with the following format');
    });
  });

  describe('generateUserPrompt', () => {
    it('should generate a basic user prompt in English by default', () => {
      const prompt = generateUserPrompt(false);
      expect(prompt).toBe('Please summarize the following conversation');
    });

    it('should generate a user prompt in Spanish when specified', () => {
      const prompt = generateUserPrompt(false, 'spanish');
      expect(prompt).toBe('Por favor, resume la siguiente conversación');
    });

    it('should generate a formatted user prompt when formatted is true', () => {
      const prompt = generateUserPrompt(true);
      expect(prompt).toBe('Please create a structured summary of the following conversation, clearly showing the main topics and each user\'s opinion or perspective on those topics');
    });

    it('should generate a formatted user prompt in Spanish when specified', () => {
      const prompt = generateUserPrompt(true, 'spanish');
      expect(prompt).toBe('Por favor, crea un resumen estructurado de la siguiente conversación, mostrando claramente los temas principales y la opinión o perspectiva de cada usuario sobre esos temas');
    });

    it('should append a custom prompt when provided', () => {
      const prompt = generateUserPrompt(false, 'english', 'Focus on technical discussions');
      expect(prompt).toBe('Please summarize the following conversation. Focus on technical discussions');
    });

    it('should append messages when provided', () => {
      const messages = ['User1: Hello', 'User2: Hi there'];
      const prompt = generateUserPrompt(false, 'english', null, messages);
      expect(prompt).toBe('Please summarize the following conversation:\n\nUser1: Hello\nUser2: Hi there');
    });

    it('should handle both custom prompt and messages', () => {
      const messages = ['User1: Hello', 'User2: Hi there'];
      const prompt = generateUserPrompt(false, 'english', 'Focus on greetings', messages);
      expect(prompt).toBe('Please summarize the following conversation. Focus on greetings:\n\nUser1: Hello\nUser2: Hi there');
    });
  });
});