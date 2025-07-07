# Local Development Setup

This guide provides step-by-step instructions for setting up the Discord Summarize bot for local development.

## Prerequisites

- Node.js v20.14.0
- npm (comes with Node.js)
- Git
- A Discord account
- An OpenAI API key
- A Google Gemini API key (optional, only if you want to use the Gemini model)

## Setup Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/discord-summarize.git
   cd discord-summarize
   ```

2. **Install Dependencies**
   ```bash
   npm install

   # If you want to use the Gemini model, also install:
   npm install @google/generative-ai
   ```

3. **Set Up Environment Variables**
   - Create a `.env` file in the root directory with the following content:
     ```
     DISCORD_TOKEN=your_discord_bot_token_here
     OPENAI_API_KEY=your_openai_api_key_here
     OPENAI_MODEL=gpt-4-turbo
     GEMINI_API_KEY=your_gemini_api_key_here
     GEMINI_MODEL=gemini-2.5-pro
     ```
   - Replace the placeholder values with your actual credentials
   - The Gemini API key is optional and only needed if you want to use the Gemini model
   - Note that the following validation rules apply:
     - For OpenAI, only the following models are supported: `gpt-4o-mini`, `gpt-4-turbo`, `gpt-4`, `gpt-3.5-turbo`
     - For Gemini, only the following models are supported: `gemini-2.5-pro`, `gemini-2.5-flash`

4. **Build the Project**
   ```bash
   npm run build
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

6. **Start the Bot in Development Mode**
   ```bash
   npm run dev
   ```
   This will start the bot with nodemon, which automatically restarts the bot when you make changes to the code.

## Development Workflow

1. **Make Changes to the Code**
   - Edit the TypeScript files in the `src` directory

2. **Lint Your Code**
   ```bash
   npm run lint
   ```
   To automatically fix linting issues:
   ```bash
   npm run lint:fix
   ```

3. **Run Tests**
   ```bash
   npm test
   ```
   To run tests with coverage report:
   ```bash
   npm run test:coverage
   ```

4. **Build the Project**
   ```bash
   npm run build
   ```

5. **Commit Your Changes**
   - The pre-commit hook will automatically lint your code before committing

## Project Structure

- `src/` - Source code
  - `models/` - AI model implementations
  - `commands/` - Discord command implementations
  - `utils/` - Utility functions
  - `__tests__/` - Test files
- `dist/` - Compiled JavaScript code (generated after build)
- `.github/workflows/` - GitHub Actions workflows

## Validation Rules

The application implements the following validation rules:

1. **Message Count**:
   - The `count` parameter must be between 1 and 500 messages
   - This validation is implemented in both `summarize.ts` and `summarizeg.ts`

2. **OpenAI Models**:
   - Only the following models are supported:
     - `gpt-4o-mini`
     - `gpt-4-turbo` (default)
     - `gpt-4`
     - `gpt-3.5-turbo`
   - This validation is implemented in `OpenAIModel.ts`

3. **Gemini Models**:
   - Only the following models are supported:
     - `gemini-2.5-pro` (default)
     - `gemini-2.5-flash`
   - This validation is implemented in `GeminiModel.ts`

## Adding a New AI Model

1. Create a new file in `src/models/` (e.g., `LocalModel.ts`)
2. Implement the `ModelInterface` interface
3. Register the model in `ModelFactory.ts`

Example of a simple local model:
```typescript
import { ModelInterface } from './ModelInterface';

export class LocalModel implements ModelInterface {
  public async summarize(messages: string[], formatted: boolean = false): Promise<string> {
    // Implementation for local model
    if (formatted) {
      return '# Formatted summary from local model';
    }
    return 'Summary from local model';
  }

  public getName(): string {
    return 'Local';
  }
}

// In ModelFactory.ts
import { LocalModel } from './LocalModel';
ModelFactory.registerModel('local', LocalModel);
```

Example of the Gemini model implementation:
```typescript
import { ModelInterface } from './ModelInterface';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiModel implements ModelInterface {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Get the model from environment or use default
    const requestedModel = process.env.GEMINI_MODEL || 'gemini-2.5-pro';

    // Validate the model - only allow specific models
    const allowedModels = ['gemini-2.5-pro', 'gemini-2.5-flash'];
    if (!allowedModels.includes(requestedModel)) {
      throw new Error(`Invalid Gemini model: ${requestedModel}. Allowed models are: ${allowedModels.join(', ')}`);
    }

    this.model = requestedModel;
  }

  public async summarize(messages: string[], formatted: boolean = false): Promise<string> {
    // Implementation for Gemini model
    const geminiModel = this.genAI.getGenerativeModel({ model: this.model });
    // ... rest of implementation
  }

  public getName(): string {
    return 'Gemini';
  }
}

// In ModelFactory.ts
import { GeminiModel } from './GeminiModel';
ModelFactory.registerModel('gemini', GeminiModel);
```

## Adding a New Command

1. Create a new file in `src/commands/` (e.g., `help.ts`)
2. Implement the command handler
3. Register the command in `src/commands/index.ts`
