/**
 * This module contains prompt templates for summarizing conversations.
 * Extracting prompts to a separate module improves maintainability and reduces duplication.
 */

/**
 * Generate system prompt for summarization
 * @param formatted Whether to generate a formatted summary
 * @param language Language for the summary (default: 'english')
 * @returns System prompt for the AI model
 */
export function generateSystemPrompt(formatted: boolean, language: string = 'english'): string {
  let systemPrompt = 'You are a helpful assistant that summarizes Discord conversations. ';

  // Set language for the summary
  if (language.toLowerCase() === 'spanish') {
    systemPrompt += 'Provide the summary in Spanish. ';
  } else {
    // Default to English for any other value
    systemPrompt += 'Provide the summary in English. ';
  }

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
  } else {
    systemPrompt += 'Create a concise summary that captures the main points and important details.';
  }

  return systemPrompt;
}

/**
 * Generate user prompt for summarization
 * @param formatted Whether to generate a formatted summary
 * @param language Language for the summary (default: 'english')
 * @param customPrompt Optional custom prompt to personalize the summary
 * @param messages Array of messages to summarize
 * @returns User prompt for the AI model
 */
export function generateUserPrompt(
  formatted: boolean,
  language: string = 'english',
  customPrompt?: string | null,
  messages: string[] = [],
): string {
  let userPrompt = '';

  if (formatted) {
    userPrompt =
      language.toLowerCase() === 'spanish'
        ? `Por favor, crea un resumen estructurado de la siguiente conversación, mostrando claramente los temas principales y la opinión o perspectiva de cada usuario sobre esos temas`
        : `Please create a structured summary of the following conversation, clearly showing the main topics and each user's opinion or perspective on those topics`;
  } else {
    userPrompt =
      language.toLowerCase() === 'spanish'
        ? `Por favor, resume la siguiente conversación`
        : `Please summarize the following conversation`;
  }

  // Add custom prompt if provided
  if (customPrompt) {
    userPrompt += `. ${customPrompt}`;
  }

  // Add the messages to the prompt if provided
  if (messages.length > 0) {
    userPrompt += `:\n\n${messages.join('\n')}`;
  }

  return userPrompt;
}
