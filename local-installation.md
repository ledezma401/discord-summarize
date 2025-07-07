# Local Development Setup

This guide provides step-by-step instructions for setting up the Discord Summarize bot for local development.

## Prerequisites

- Node.js v20.14.0
- npm (comes with Node.js)
- Git
- A Discord account
- An OpenAI API key

## Setup Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/discord-summarize.git
   cd discord-summarize
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   - Create a `.env` file in the root directory with the following content:
     ```
     DISCORD_TOKEN=your_discord_bot_token_here
     OPENAI_API_KEY=your_openai_api_key_here
     OPENAI_MODEL=gpt-4-turbo
     ```
   - Replace the placeholder values with your actual credentials

4. **Build the Project**
   ```bash
   npm run build
   ```

5. **Run Tests**
   ```bash
   # Run unit tests only (no external API calls)
   npm test

   # Run integration tests (requires API keys)
   npm run test:integration

   # Run all tests (both unit and integration)
   npm run test:all
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

## Adding a New AI Model

1. Create a new file in `src/models/` (e.g., `LocalModel.ts`)
2. Implement the `ModelInterface` interface
3. Register the model in `ModelFactory.ts`

Example:
```typescript
import { ModelInterface } from './ModelInterface';

export class LocalModel implements ModelInterface {
  public async summarize(messages: string[]): Promise<string> {
    // Implementation for local model
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

## Adding a New Command

1. Create a new file in `src/commands/` (e.g., `help.ts`)
2. Implement the command handler
3. Register the command in `src/commands/index.ts`
