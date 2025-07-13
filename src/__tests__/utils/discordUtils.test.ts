import { splitTextIntoChunks } from '../../utils/discordUtils.js';
import { jest, expect, describe, it } from '@jest/globals';

describe('discordUtils', () => {
  describe('splitTextIntoChunks', () => {
    it('should return the original text when it is shorter than the chunk size', () => {
      const text = 'This is a short text';
      const result = splitTextIntoChunks(text, 100);
      expect(result).toEqual([text]);
    });

    it('should return the original text when it is exactly the chunk size', () => {
      const text = 'a'.repeat(100);
      const result = splitTextIntoChunks(text, 100);
      expect(result).toEqual([text]);
    });

    it('should handle empty string', () => {
      const text = '';
      const result = splitTextIntoChunks(text);
      expect(result).toEqual(['']);
    });

    it('should split text at newlines when possible', () => {
      const text = 'Line 1\nLine 2\nLine 3 is very long and should be split at the newline character';
      const result = splitTextIntoChunks(text, 20);

      expect(result).toEqual([
        'Line 1\nLine 2',
        'Line 3 is very long',
        'and should be split',
        'at the newline',
        'character'
      ]);
    });

    it('should split text at spaces when no newlines are available', () => {
      const text = 'This is a long text without newlines that should be split at spaces';
      const result = splitTextIntoChunks(text, 20);

      expect(result).toEqual([
        'This is a long text',
        'without newlines',
        'that should be split',
        'at spaces'
      ]);
    });

    it('should force split text when no good breaking points are found', () => {
      const text = 'ThisIsAVeryLongTextWithoutAnySpacesOrNewlinesWhichWillRequireForcedBreaking';
      const result = splitTextIntoChunks(text, 10);

      expect(result).toEqual([
        'ThisIsAVer',
        'yLongTextW',
        'ithoutAnyS',
        'pacesOrNew',
        'linesWhich',
        'WillRequir',
        'eForcedBre',
        'aking'
      ]);
    });

    it('should use the default chunk size if not specified', () => {
      const text = 'a'.repeat(5000);
      const result = splitTextIntoChunks(text);

      // Default chunk size is 4000 (DISCORD_EMBED_DESCRIPTION_LIMIT)
      expect(result.length).toBe(2);
      expect(result[0].length).toBe(4000);
      expect(result[1].length).toBe(1000);
    });

    it('should handle mixed breaking scenarios', () => {
      const text = 'First paragraph with spaces.\nSecond paragraph.\nThirdParagraphWithoutSpacesButWithNewlines\nFourth paragraph.';
      const result = splitTextIntoChunks(text, 25);

      expect(result).toEqual([
        'First paragraph with',
        'spaces.\nSecond paragraph.',
        'ThirdParagraphWithoutSpac',
        'esButWithNewlines',
        'Fourth paragraph.'
      ]);
    });

    it('should trim whitespace at the beginning of chunks after splitting', () => {
      const text = 'First line\n \nSecond line with spaces';
      const result = splitTextIntoChunks(text, 15);

      expect(result).toEqual([
        'First line',
        'Second line',
        'with spaces'
      ]);
    });
  });
});
